import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { status } = req.query
  let sql = `
    SELECT e.*, l.nome AS lote_nome,
      (SELECT COUNT(*) FROM animais a WHERE a.lote_id = e.lote_id) AS qtd_animais
    FROM eventos_sanitarios e
    LEFT JOIN lotes l ON e.lote_id = l.id
    LEFT JOIN animais a2 ON e.animal_id = a2.id
    WHERE (a2.fazenda_id = ? OR l.fazenda_id = ?)
  `
  const params = [req.fazendaId, req.fazendaId]
  if (status === 'proximas') {
    sql += ' AND e.data_proxima_dose IS NOT NULL AND e.data_proxima_dose >= CURDATE() ORDER BY e.data_proxima_dose'
  } else if (status === 'vencidas') {
    sql += ' AND e.data_proxima_dose IS NOT NULL AND e.data_proxima_dose < CURDATE() ORDER BY e.data_proxima_dose'
  } else {
    sql += ' ORDER BY e.data DESC'
  }
  const [rows] = await pool.query(sql, params)
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { tipo, aplicado_em, animal_id, lote_id, produto, dose, data, responsavel, custo } = req.body

  const dataProxima = data ? new Date(new Date(data).getTime() + 180 * 86400000).toISOString().slice(0, 10) : null

  if (aplicado_em === 'lote' && lote_id) {
    const [result] = await pool.query(
      'INSERT INTO eventos_sanitarios (tipo, aplicado_em, lote_id, produto, dose, data, data_proxima_dose, responsavel, custo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tipo, 'lote', lote_id, produto, dose, data, dataProxima, responsavel, custo]
    )

    const [animais] = await pool.query('SELECT id FROM animais WHERE lote_id = ? AND fazenda_id = ?', [lote_id, req.fazendaId])
    for (const a of animais) {
      await pool.query(
        'INSERT INTO eventos_sanitarios (tipo, aplicado_em, animal_id, lote_id, produto, dose, data, data_proxima_dose, responsavel, custo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [tipo, 'animal', a.id, lote_id, produto, dose, data, dataProxima, responsavel, custo ? custo / animais.length : null]
      )
    }
    res.status(201).json({ id: result.insertId, animais_afetados: animais.length })
  } else {
    const [result] = await pool.query(
      'INSERT INTO eventos_sanitarios (tipo, aplicado_em, animal_id, produto, dose, data, data_proxima_dose, responsavel, custo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tipo, 'animal', animal_id, produto, dose, data, dataProxima, responsavel, custo]
    )
    res.status(201).json({ id: result.insertId })
  }
})

router.put('/:id', async (req, res) => {
  const { tipo, produto, dose, data, responsavel, custo } = req.body
  const dataProxima = data ? new Date(new Date(data).getTime() + 180 * 86400000).toISOString().slice(0, 10) : null
  await pool.query(
    'UPDATE eventos_sanitarios SET tipo=?, produto=?, dose=?, data=?, data_proxima_dose=?, responsavel=?, custo=? WHERE id=?',
    [tipo, produto, dose, data, dataProxima, responsavel, custo, req.params.id]
  )
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM eventos_sanitarios WHERE id = ?', [req.params.id])
  res.json({ ok: true })
})

export default router
