import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT l.*,
      (SELECT COUNT(*) FROM animais a WHERE a.lote_id = l.id) AS qtd_animais,
      (SELECT ROUND(AVG(p.peso_kg)) FROM pesagens p
        INNER JOIN (SELECT animal_id, MAX(data) as max_data FROM pesagens GROUP BY animal_id) ult
          ON p.animal_id = ult.animal_id AND p.data = ult.max_data
        INNER JOIN animais a ON a.id = p.animal_id
        WHERE a.lote_id = l.id
      ) AS peso_medio
    FROM lotes l WHERE l.fazenda_id = ? ORDER BY l.nome
  `, [req.fazendaId])
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM lotes WHERE id = ? AND fazenda_id = ?', [req.params.id, req.fazendaId])
  if (!rows.length) return res.status(404).json({ error: 'Lote não encontrado' })
  res.json(rows[0])
})

router.get('/:id/animais', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.*,
      (SELECT p.peso_kg FROM pesagens p WHERE p.animal_id = a.id ORDER BY p.data DESC LIMIT 1) AS peso_atual
    FROM animais a WHERE a.lote_id = ? AND a.fazenda_id = ? ORDER BY a.brinco
  `, [req.params.id, req.fazendaId])
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { nome, tipo, area_ha, capacidade } = req.body
  const [result] = await pool.query(
    'INSERT INTO lotes (nome, tipo, area_ha, capacidade, fazenda_id) VALUES (?, ?, ?, ?, ?)',
    [nome, tipo || 'pasto', area_ha, capacidade, req.fazendaId]
  )
  res.status(201).json({ id: result.insertId })
})

router.put('/:id', async (req, res) => {
  const { nome, tipo, area_ha, capacidade } = req.body
  await pool.query(
    'UPDATE lotes SET nome=?, tipo=?, area_ha=?, capacidade=? WHERE id=? AND fazenda_id=?',
    [nome, tipo, area_ha, capacidade, req.params.id, req.fazendaId]
  )
  res.json({ ok: true })
})

export default router
