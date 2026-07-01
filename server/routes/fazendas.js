import { Router } from 'express'
import bcrypt from 'bcryptjs'
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

router.put('/:fazendaId/usuarios/:userId/senha', async (req, res) => {
  if (req.userPapel !== 'admin') return res.status(403).json({ error: 'Apenas administradores podem redefinir senhas' })

  const { fazendaId, userId } = req.params
  const { nova_senha } = req.body

  if (!nova_senha || nova_senha.length < 6) return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })

  const [admin] = await pool.query('SELECT fazenda_id FROM usuarios WHERE id = ?', [req.userId])
  if (!admin.length || String(admin[0].fazenda_id) !== fazendaId) return res.status(403).json({ error: 'Acesso negado' })

  const [target] = await pool.query('SELECT papel FROM usuarios WHERE id = ? AND fazenda_id = ?', [userId, fazendaId])
  if (!target.length) return res.status(404).json({ error: 'Usuário não encontrado' })
  if (target[0].papel === 'admin') return res.status(400).json({ error: 'Não é possível redefinir a senha do administrador' })

  const hash = await bcrypt.hash(nova_senha, 10)
  await pool.query('UPDATE usuarios SET senha_hash = ? WHERE id = ? AND fazenda_id = ?', [hash, userId, fazendaId])
  res.json({ ok: true })
})

export default router
