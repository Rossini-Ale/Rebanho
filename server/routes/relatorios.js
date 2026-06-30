import { Router } from 'express'
import pool from '../db.js'

const router = Router()

function whereDate(campo, dataInicio, dataFim) {
  const parts = []
  const params = []
  if (dataInicio) { parts.push(`${campo} >= ?`); params.push(dataInicio) }
  if (dataFim) { parts.push(`${campo} <= ?`); params.push(dataFim) }
  return { sql: parts.length ? ' AND ' + parts.join(' AND ') : '', params }
}

router.get('/rebanho', async (req, res) => {
  const fid = req.fazendaId
  const { dataInicio, dataFim } = req.query

  const [[totais]] = await pool.query(`
    SELECT
      COUNT(*) as total,
      SUM(sexo = 'Macho') as machos,
      SUM(sexo = 'Fêmea') as femeas,
      SUM(situacao = 'ativo') as ativos,
      SUM(situacao = 'vendido') as vendidos,
      SUM(situacao = 'morto') as mortos,
      SUM(situacao = 'prenhe') as prenhes
    FROM animais WHERE fazenda_id = ?
  `, [fid])

  const [porRaca] = await pool.query(`
    SELECT raca, COUNT(*) as total
    FROM animais WHERE fazenda_id = ? AND situacao NOT IN ('vendido','morto')
    GROUP BY raca ORDER BY total DESC
  `, [fid])

  const [porLote] = await pool.query(`
    SELECT l.nome, COUNT(a.id) as total,
      ROUND(AVG(ult.peso_kg)) as peso_medio
    FROM lotes l
    LEFT JOIN animais a ON a.lote_id = l.id AND a.situacao NOT IN ('vendido','morto')
    LEFT JOIN (
      SELECT p.animal_id, p.peso_kg FROM pesagens p
      INNER JOIN (SELECT animal_id, MAX(data) as md FROM pesagens GROUP BY animal_id) u
        ON p.animal_id = u.animal_id AND p.data = u.md
    ) ult ON ult.animal_id = a.id
    WHERE l.fazenda_id = ?
    GROUP BY l.id, l.nome ORDER BY total DESC
  `, [fid])

  const dateW = whereDate('a.data_nascimento', dataInicio, dataFim)
  const [entradas] = await pool.query(
    `SELECT COUNT(*) as total FROM animais a WHERE a.fazenda_id = ? AND a.origem = 'nascido_aqui'${dateW.sql}`,
    [fid, ...dateW.params]
  )

  const dateWV = whereDate('a.updated_at', dataInicio, dataFim)
  const [[vendidosPeriodo]] = await pool.query(
    `SELECT COUNT(*) as total FROM animais a WHERE a.fazenda_id = ? AND a.situacao = 'vendido'`,
    [fid]
  )

  const [[pesoMedio]] = await pool.query(`
    SELECT ROUND(AVG(p.peso_kg)) as media FROM pesagens p
    INNER JOIN (SELECT animal_id, MAX(data) as md FROM pesagens GROUP BY animal_id) u
      ON p.animal_id = u.animal_id AND p.data = u.md
    INNER JOIN animais a ON a.id = p.animal_id
    WHERE a.fazenda_id = ? AND a.situacao NOT IN ('vendido','morto')
  `, [fid])

  res.json({
    totais: {
      total: totais.total,
      machos: totais.machos || 0,
      femeas: totais.femeas || 0,
      ativos: totais.ativos || 0,
      vendidos: totais.vendidos || 0,
      mortos: totais.mortos || 0,
      prenhes: totais.prenhes || 0,
    },
    por_raca: porRaca,
    por_lote: porLote,
    entradas_periodo: entradas[0]?.total || 0,
    saidas_periodo: vendidosPeriodo.total || 0,
    peso_medio: pesoMedio.media || 0,
  })
})

router.get('/sanidade', async (req, res) => {
  const fid = req.fazendaId
  const { dataInicio, dataFim } = req.query
  const dateW = whereDate('e.data', dataInicio, dataFim)

  const [porTipo] = await pool.query(`
    SELECT tipo, COUNT(*) as total
    FROM eventos_sanitarios e
    LEFT JOIN animais a ON e.animal_id = a.id
    LEFT JOIN lotes l ON e.lote_id = l.id
    WHERE (a.fazenda_id = ? OR l.fazenda_id = ?)${dateW.sql}
    GROUP BY tipo ORDER BY total DESC
  `, [fid, fid, ...dateW.params])

  const [porProduto] = await pool.query(`
    SELECT produto, COUNT(*) as eventos,
      SUM(CASE WHEN aplicado_em = 'lote' THEN COALESCE(
        (SELECT COUNT(*) FROM animais aa WHERE aa.lote_id = e.lote_id AND aa.fazenda_id = ?), 1
      ) ELSE 1 END) as animais_afetados
    FROM eventos_sanitarios e
    LEFT JOIN animais a ON e.animal_id = a.id
    LEFT JOIN lotes l ON e.lote_id = l.id
    WHERE (a.fazenda_id = ? OR l.fazenda_id = ?)${dateW.sql}
    GROUP BY produto ORDER BY eventos DESC LIMIT 10
  `, [fid, fid, fid, ...dateW.params])

  const [proximasVacinas] = await pool.query(`
    SELECT e.produto, e.data_proxima_dose, l.nome as lote_nome,
      (SELECT COUNT(*) FROM animais aa WHERE aa.lote_id = e.lote_id AND aa.fazenda_id = ?) as qtd_animais
    FROM eventos_sanitarios e
    INNER JOIN lotes l ON e.lote_id = l.id AND l.fazenda_id = ?
    WHERE e.data_proxima_dose >= CURDATE() AND e.aplicado_em = 'lote'
    ORDER BY e.data_proxima_dose LIMIT 5
  `, [fid, fid])

  const [[totalEventos]] = await pool.query(`
    SELECT COUNT(*) as total FROM eventos_sanitarios e
    LEFT JOIN animais a ON e.animal_id = a.id
    LEFT JOIN lotes l ON e.lote_id = l.id
    WHERE (a.fazenda_id = ? OR l.fazenda_id = ?)${dateW.sql}
  `, [fid, fid, ...dateW.params])

  res.json({
    total_eventos: totalEventos.total,
    por_tipo: porTipo,
    por_produto: porProduto,
    proximas_vacinas: proximasVacinas,
  })
})

router.get('/financeiro', async (req, res) => {
  const fid = req.fazendaId
  const { dataInicio, dataFim } = req.query
  const dateW = whereDate('lf.data', dataInicio, dataFim)

  const base = `FROM lancamentos_financeiros lf
    LEFT JOIN animais a ON lf.animal_id = a.id
    LEFT JOIN lotes l ON lf.lote_id = l.id
    WHERE lf.lancamento_pai_id IS NULL
      AND (a.fazenda_id = ? OR l.fazenda_id = ? OR (lf.animal_id IS NULL AND lf.lote_id IS NULL))
      ${dateW.sql}`
  const p = [fid, fid, ...dateW.params]

  const [[receita]] = await pool.query(`SELECT COALESCE(SUM(lf.valor), 0) as total ${base} AND lf.valor > 0`, p)
  const [[despesa]] = await pool.query(`SELECT COALESCE(SUM(ABS(lf.valor)), 0) as total ${base} AND lf.valor < 0`, p)
  const [porCategoria] = await pool.query(`
    SELECT lf.categoria, lf.tipo,
      SUM(CASE WHEN lf.valor > 0 THEN lf.valor ELSE 0 END) as receita,
      SUM(CASE WHEN lf.valor < 0 THEN ABS(lf.valor) ELSE 0 END) as despesa
    ${base} GROUP BY lf.categoria, lf.tipo ORDER BY (receita + despesa) DESC
  `, p)
  const [topLancamentos] = await pool.query(`
    SELECT lf.id, lf.descricao, lf.categoria, lf.valor, lf.data, lf.tipo
    ${base} ORDER BY ABS(lf.valor) DESC LIMIT 10
  `, p)

  res.json({
    receita: parseFloat(receita.total),
    despesa: parseFloat(despesa.total),
    resultado: parseFloat(receita.total) - parseFloat(despesa.total),
    por_categoria: porCategoria.map(r => ({
      categoria: r.categoria,
      tipo: r.tipo,
      receita: parseFloat(r.receita),
      despesa: parseFloat(r.despesa),
    })),
    top_lancamentos: topLancamentos,
  })
})

export default router
