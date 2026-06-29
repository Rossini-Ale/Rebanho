import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM fazendas WHERE id = ?', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Fazenda não encontrada' })
  res.json(rows[0])
})

router.put('/:id', async (req, res) => {
  const { nome, localizacao } = req.body
  await pool.query('UPDATE fazendas SET nome = ?, localizacao = ? WHERE id = ?', [nome, localizacao, req.params.id])
  res.json({ ok: true })
})

router.get('/:id/usuarios', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, nome, usuario, email, papel, criado_em FROM usuarios WHERE fazenda_id = ? ORDER BY criado_em',
    [req.params.id]
  )
  res.json(rows)
})

router.delete('/:fazendaId/usuarios/:userId', async (req, res) => {
  const { fazendaId, userId } = req.params
  const [user] = await pool.query('SELECT papel FROM usuarios WHERE id = ? AND fazenda_id = ?', [userId, fazendaId])
  if (!user.length) return res.status(404).json({ error: 'Usuário não encontrado' })
  if (user[0].papel === 'admin') return res.status(400).json({ error: 'Não é possível remover o administrador' })
  await pool.query('DELETE FROM usuarios WHERE id = ? AND fazenda_id = ?', [userId, fazendaId])
  res.json({ ok: true })
})

export default router
