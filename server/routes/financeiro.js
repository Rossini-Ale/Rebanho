import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { mes, ano } = req.query
  const fid = req.fazendaId
  let sql = `
    SELECT lf.* FROM lancamentos_financeiros lf
    LEFT JOIN animais a ON lf.animal_id = a.id
    LEFT JOIN lotes l ON lf.lote_id = l.id
    WHERE lf.lancamento_pai_id IS NULL
      AND (a.fazenda_id = ? OR l.fazenda_id = ? OR (lf.animal_id IS NULL AND lf.lote_id IS NULL))
  `
  const params = [fid, fid]
  if (mes && ano) {
    sql += ' AND MONTH(lf.data) = ? AND YEAR(lf.data) = ?'
    params.push(mes, ano)
  }
  sql += ' ORDER BY lf.data DESC'
  const [rows] = await pool.query(sql, params)
  res.json(rows)
})

router.get('/resumo', async (req, res) => {
  const { mes, ano } = req.query
  const fid = req.fazendaId
  let where = `WHERE lf.lancamento_pai_id IS NULL
    AND (a.fazenda_id = ? OR l.fazenda_id = ? OR (lf.animal_id IS NULL AND lf.lote_id IS NULL))`
  const params = [fid, fid]
  if (mes && ano) {
    where += ' AND MONTH(lf.data) = ? AND YEAR(lf.data) = ?'
    params.push(mes, ano)
  }

  const base = `FROM lancamentos_financeiros lf LEFT JOIN animais a ON lf.animal_id = a.id LEFT JOIN lotes l ON lf.lote_id = l.id`
  const [receita] = await pool.query(`SELECT COALESCE(SUM(lf.valor), 0) AS total ${base} ${where} AND lf.valor > 0`, params)
  const [despesa] = await pool.query(`SELECT COALESCE(SUM(ABS(lf.valor)), 0) AS total ${base} ${where} AND lf.valor < 0`, params)
  const [porCategoria] = await pool.query(`SELECT lf.categoria, SUM(ABS(lf.valor)) AS total ${base} ${where} AND lf.valor < 0 GROUP BY lf.categoria ORDER BY total DESC`, params)

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
    WHERE l.fazenda_id = ?
    GROUP BY l.id, l.nome
    ORDER BY (COALESCE(SUM(CASE WHEN f.valor > 0 THEN f.valor ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN f.valor < 0 THEN ABS(f.valor) ELSE 0 END), 0)) DESC
  `, [req.fazendaId])
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

    const [animais] = await pool.query('SELECT id FROM animais WHERE lote_id = ? AND fazenda_id = ?', [lote_id, req.fazendaId])
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

router.put('/:id', async (req, res) => {
  const { tipo, categoria, valor, data, descricao } = req.body
  await pool.query(
    'UPDATE lancamentos_financeiros SET tipo=?, categoria=?, valor=?, data=?, descricao=? WHERE id=? AND lancamento_pai_id IS NULL',
    [tipo, categoria, valor, data, descricao, req.params.id]
  )
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM lancamentos_financeiros WHERE lancamento_pai_id = ?', [req.params.id])
  await pool.query('DELETE FROM lancamentos_financeiros WHERE id = ?', [req.params.id])
  res.json({ ok: true })
})

export default router
