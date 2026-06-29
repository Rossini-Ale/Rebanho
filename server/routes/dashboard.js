import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/stats', async (req, res) => {
  const [[totalAnimais]] = await pool.query('SELECT COUNT(*) as total FROM animais')
  const [[ativos]] = await pool.query("SELECT COUNT(*) as total FROM animais WHERE situacao = 'ativo'")

  const [[pesoMedio]] = await pool.query(`
    SELECT ROUND(AVG(p.peso_kg)) as media FROM pesagens p
    INNER JOIN (SELECT animal_id, MAX(data) as max_data FROM pesagens GROUP BY animal_id) ult
      ON p.animal_id = ult.animal_id AND p.data = ult.max_data
  `)

  const [[prenhes]] = await pool.query("SELECT COUNT(*) as total FROM animais WHERE situacao = 'prenhe'")

  const [[receita]] = await pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM lancamentos_financeiros WHERE valor > 0 AND lancamento_pai_id IS NULL AND MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE())")
  const [[despesa]] = await pool.query("SELECT COALESCE(SUM(ABS(valor)), 0) as total FROM lancamentos_financeiros WHERE valor < 0 AND lancamento_pai_id IS NULL AND MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE())")

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
  const alertas = []

  const [vencidos] = await pool.query(`
    SELECT e.id, e.produto, e.lote_id, e.data_proxima_dose, l.nome as lote_nome,
      (SELECT COUNT(*) FROM animais a WHERE a.lote_id = e.lote_id) as qtd
    FROM eventos_sanitarios e
    LEFT JOIN lotes l ON e.lote_id = l.id
    WHERE e.aplicado_em = 'lote' AND e.data_proxima_dose IS NOT NULL AND e.data_proxima_dose < CURDATE()
    GROUP BY e.lote_id, e.produto, e.id, e.data_proxima_dose, l.nome
    ORDER BY e.data_proxima_dose
  `)
  for (const v of vencidos) {
    const dias = Math.round((new Date() - new Date(v.data_proxima_dose)) / 86400000)
    alertas.push({ urgency: 'vencido', title: `${v.produto} vencido`, subtitle: `Lote ${v.lote_nome} · ${v.qtd} animais`, deadline: `Atrasado há ${dias} dias` })
  }

  const [partos] = await pool.query(`
    SELECT c.*, a.brinco, a.raca FROM coberturas c
    INNER JOIN animais a ON c.femea_id = a.id
    WHERE c.status IN ('parto_proximo','confirmada') AND c.data_prevista_parto IS NOT NULL
      AND c.data_prevista_parto BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    ORDER BY c.data_prevista_parto
  `)
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
      (SELECT COUNT(*) FROM animais a WHERE a.lote_id = e.lote_id) as qtd
    FROM eventos_sanitarios e
    LEFT JOIN lotes l ON e.lote_id = l.id
    WHERE e.aplicado_em = 'lote' AND e.data_proxima_dose IS NOT NULL
      AND e.data_proxima_dose BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    GROUP BY e.lote_id, e.produto, e.id, e.data_proxima_dose, l.nome
    ORDER BY e.data_proxima_dose
  `)
  for (const ev of proxEventos) {
    const dias = Math.round((new Date(ev.data_proxima_dose) - new Date()) / 86400000)
    alertas.push({ urgency: 'proximo', title: ev.produto, subtitle: `Lote ${ev.lote_nome} · ${ev.qtd} animais`, deadline: `Em ${dias} dias` })
  }

  res.json(alertas)
})

export default router
