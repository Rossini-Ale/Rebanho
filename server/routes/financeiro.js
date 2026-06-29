import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { mes, ano } = req.query
  let sql = 'SELECT * FROM lancamentos_financeiros WHERE lancamento_pai_id IS NULL'
  const params = []
  if (mes && ano) {
    sql += ' AND MONTH(data) = ? AND YEAR(data) = ?'
    params.push(mes, ano)
  }
  sql += ' ORDER BY data DESC'
  const [rows] = await pool.query(sql, params)
  res.json(rows)
})

router.get('/resumo', async (req, res) => {
  const { mes, ano } = req.query
  let where = 'WHERE lancamento_pai_id IS NULL'
  const params = []
  if (mes && ano) {
    where += ' AND MONTH(data) = ? AND YEAR(data) = ?'
    params.push(mes, ano)
  }

  const [receita] = await pool.query(`SELECT COALESCE(SUM(valor), 0) AS total FROM lancamentos_financeiros ${where} AND valor > 0`, params)
  const [despesa] = await pool.query(`SELECT COALESCE(SUM(ABS(valor)), 0) AS total FROM lancamentos_financeiros ${where} AND valor < 0`, params)
  const [porCategoria] = await pool.query(`SELECT categoria, SUM(ABS(valor)) AS total FROM lancamentos_financeiros ${where} AND valor < 0 GROUP BY categoria ORDER BY total DESC`, params)

  res.json({
    receita: receita[0].total,
    despesa: despesa[0].total,
    resultado: receita[0].total - despesa[0].total,
    por_categoria: porCategoria,
  })
})

router.get('/por-lote', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT l.id, l.nome,
      COALESCE(SUM(CASE WHEN f.valor > 0 THEN f.valor ELSE 0 END), 0) as receita,
      COALESCE(SUM(CASE WHEN f.valor < 0 THEN ABS(f.valor) ELSE 0 END), 0) as despesa
    FROM lotes l
    LEFT JOIN lancamentos_financeiros f ON f.lote_id = l.id AND f.lancamento_pai_id IS NULL
    GROUP BY l.id, l.nome
    ORDER BY (COALESCE(SUM(CASE WHEN f.valor > 0 THEN f.valor ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN f.valor < 0 THEN ABS(f.valor) ELSE 0 END), 0)) DESC
  `)
  res.json(rows.map(r => ({
    nome: r.nome,
    receita: parseFloat(r.receita),
    despesa: parseFloat(r.despesa),
    resultado: parseFloat(r.receita) - parseFloat(r.despesa),
  })))
})

router.post('/', async (req, res) => {
  const { escopo, lote_id, animal_id, tipo, categoria, valor, data, recorrencia, descricao } = req.body

  if (escopo === 'lote' && lote_id) {
    const [pai] = await pool.query(
      'INSERT INTO lancamentos_financeiros (escopo, lote_id, tipo, categoria, valor, data, recorrencia, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['lote', lote_id, tipo, categoria, valor, data, recorrencia, descricao]
    )

    const [animais] = await pool.query('SELECT id FROM animais WHERE lote_id = ?', [lote_id])
    const valorRateado = animais.length ? valor / animais.length : valor
    for (const a of animais) {
      await pool.query(
        'INSERT INTO lancamentos_financeiros (escopo, animal_id, lote_id, tipo, categoria, valor, data, descricao, lancamento_pai_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['animal', a.id, lote_id, tipo, categoria, valorRateado, data, `Rateio: ${descricao || categoria}`, pai.insertId]
      )
    }
    res.status(201).json({ id: pai.insertId, animais_rateados: animais.length })
  } else {
    const [result] = await pool.query(
      'INSERT INTO lancamentos_financeiros (escopo, lote_id, animal_id, tipo, categoria, valor, data, recorrencia, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [escopo || 'geral', lote_id, animal_id, tipo, categoria, valor, data, recorrencia, descricao]
    )
    res.status(201).json({ id: result.insertId })
  }
})

export default router
