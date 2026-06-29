import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/stats', async (req, res) => {
  const fid = req.fazendaId
  const [[totalAnimais]] = await pool.query('SELECT COUNT(*) as total FROM animais WHERE fazenda_id = ?', [fid])
  const [[ativos]] = await pool.query("SELECT COUNT(*) as total FROM animais WHERE situacao = 'ativo' AND fazenda_id = ?", [fid])

  const [[pesoMedio]] = await pool.query(`
    SELECT ROUND(AVG(p.peso_kg)) as media FROM pesagens p
    INNER JOIN (SELECT animal_id, MAX(data) as max_data FROM pesagens GROUP BY animal_id) ult
      ON p.animal_id = ult.animal_id AND p.data = ult.max_data
    INNER JOIN animais a ON a.id = p.animal_id
    WHERE a.fazenda_id = ?
  `, [fid])

  const [[prenhes]] = await pool.query("SELECT COUNT(*) as total FROM animais WHERE situacao = 'prenhe' AND fazenda_id = ?", [fid])

  const [[receita]] = await pool.query(`
    SELECT COALESCE(SUM(lf.valor), 0) as total FROM lancamentos_financeiros lf
    LEFT JOIN animais a ON lf.animal_id = a.id
    LEFT JOIN lotes l ON lf.lote_id = l.id
    WHERE lf.valor > 0 AND lf.lancamento_pai_id IS NULL AND MONTH(lf.data) = MONTH(CURDATE()) AND YEAR(lf.data) = YEAR(CURDATE())
      AND (a.fazenda_id = ? OR l.fazenda_id = ? OR (lf.animal_id IS NULL AND lf.lote_id IS NULL))
  `, [fid, fid])
  const [[despesa]] = await pool.query(`
    SELECT COALESCE(SUM(ABS(lf.valor)), 0) as total FROM lancamentos_financeiros lf
    LEFT JOIN animais a ON lf.animal_id = a.id
    LEFT JOIN lotes l ON lf.lote_id = l.id
    WHERE lf.valor < 0 AND lf.lancamento_pai_id IS NULL AND MONTH(lf.data) = MONTH(CURDATE()) AND YEAR(lf.data) = YEAR(CURDATE())
      AND (a.fazenda_id = ? OR l.fazenda_id = ? OR (lf.animal_id IS NULL AND lf.lote_id IS NULL))
  `, [fid, fid])

  res.json({
    total_animais: totalAnimais.total,
    ativos: ativos.total,
    peso_medio: pesoMedio.media || 0,
    prenhes: prenhes.total,
    receita_mes: parseFloat(receita.total),
    despesa_mes: parseFloat(despesa.total),
    resultado_mes: parseFloat(receita.total) - parseFloat(despesa.total),
  })
})

router.get('/alertas', async (req, res) => {
  const fid = req.fazendaId
  const alertas = []

  const [vencidos] = await pool.query(`
    SELECT e.id, e.produto, e.lote_id, e.data_proxima_dose, l.nome as lote_nome,
      (SELECT COUNT(*) FROM animais a WHERE a.lote_id = e.lote_id AND a.fazenda_id = ?) as qtd
    FROM eventos_sanitarios e
    INNER JOIN lotes l ON e.lote_id = l.id AND l.fazenda_id = ?
    WHERE e.aplicado_em = 'lote' AND e.data_proxima_dose IS NOT NULL AND e.data_proxima_dose < CURDATE()
    GROUP BY e.lote_id, e.produto, e.id, e.data_proxima_dose, l.nome
    ORDER BY e.data_proxima_dose
  `, [fid, fid])
  for (const v of vencidos) {
    const dias = Math.round((new Date() - new Date(v.data_proxima_dose)) / 86400000)
    alertas.push({ urgency: 'vencido', title: `${v.produto} vencido`, subtitle: `Lote ${v.lote_nome} · ${v.qtd} animais`, deadline: `Atrasado há ${dias} dias` })
  }

  const [partos] = await pool.query(`
    SELECT c.*, a.brinco, a.raca FROM coberturas c
    INNER JOIN animais a ON c.femea_id = a.id
    WHERE a.fazenda_id = ? AND c.status IN ('parto_proximo','confirmada') AND c.data_prevista_parto IS NOT NULL
      AND c.data_prevista_parto BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    ORDER BY c.data_prevista_parto
  `, [fid])
  for (const p of partos) {
    const dias = Math.round((new Date(p.data_prevista_parto) - new Date()) / 86400000)
    alertas.push({
      urgency: dias <= 1 ? 'proximo' : 'agendado',
      title: 'Parto previsto',
      subtitle: `Brinco ${p.brinco} · ${p.raca}`,
      deadline: dias <= 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `Em ${dias} dias`,
    })
  }

  const [proxEventos] = await pool.query(`
    SELECT e.id, e.produto, e.lote_id, e.data_proxima_dose, l.nome as lote_nome,
      (SELECT COUNT(*) FROM animais a WHERE a.lote_id = e.lote_id AND a.fazenda_id = ?) as qtd
    FROM eventos_sanitarios e
    INNER JOIN lotes l ON e.lote_id = l.id AND l.fazenda_id = ?
    WHERE e.aplicado_em = 'lote' AND e.data_proxima_dose IS NOT NULL
      AND e.data_proxima_dose BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    GROUP BY e.lote_id, e.produto, e.id, e.data_proxima_dose, l.nome
    ORDER BY e.data_proxima_dose
  `, [fid, fid])
  for (const ev of proxEventos) {
    const dias = Math.round((new Date(ev.data_proxima_dose) - new Date()) / 86400000)
    alertas.push({ urgency: 'proximo', title: ev.produto, subtitle: `Lote ${ev.lote_nome} · ${ev.qtd} animais`, deadline: `Em ${dias} dias` })
  }

  res.json(alertas)
})

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

router.get('/mensal', async (req, res) => {
  const fid = req.fazendaId
  const ano = new Date().getFullYear()

  const [receitas] = await pool.query(`
    SELECT MONTH(lf.data) as mes, COALESCE(SUM(lf.valor), 0) as total
    FROM lancamentos_financeiros lf
    LEFT JOIN animais a ON lf.animal_id = a.id
    LEFT JOIN lotes l ON lf.lote_id = l.id
    WHERE lf.valor > 0 AND lf.lancamento_pai_id IS NULL AND YEAR(lf.data) = ?
      AND (a.fazenda_id = ? OR l.fazenda_id = ? OR (lf.animal_id IS NULL AND lf.lote_id IS NULL))
    GROUP BY MONTH(lf.data)
  `, [ano, fid, fid])

  const [despesas] = await pool.query(`
    SELECT MONTH(lf.data) as mes, COALESCE(SUM(ABS(lf.valor)), 0) as total
    FROM lancamentos_financeiros lf
    LEFT JOIN animais a ON lf.animal_id = a.id
    LEFT JOIN lotes l ON lf.lote_id = l.id
    WHERE lf.valor < 0 AND lf.lancamento_pai_id IS NULL AND YEAR(lf.data) = ?
      AND (a.fazenda_id = ? OR l.fazenda_id = ? OR (lf.animal_id IS NULL AND lf.lote_id IS NULL))
    GROUP BY MONTH(lf.data)
  `, [ano, fid, fid])

  const [pesos] = await pool.query(`
    SELECT MONTH(p.data) as mes, ROUND(AVG(p.peso_kg)) as media
    FROM pesagens p
    INNER JOIN animais a ON a.id = p.animal_id
    WHERE a.fazenda_id = ? AND YEAR(p.data) = ?
    GROUP BY MONTH(p.data)
  `, [fid, ano])

  const receitaMap = Object.fromEntries(receitas.map(r => [r.mes, parseFloat(r.total)]))
  const despesaMap = Object.fromEntries(despesas.map(r => [r.mes, parseFloat(r.total)]))
  const pesoMap = Object.fromEntries(pesos.map(r => [r.mes, r.media || 0]))

  const dados = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    nome: MESES[i],
    receita: receitaMap[i + 1] || 0,
    despesa: despesaMap[i + 1] || 0,
    peso_medio: pesoMap[i + 1] || 0,
  }))

  res.json(dados)
})

export default router
