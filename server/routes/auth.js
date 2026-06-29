import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import pool from '../db.js'

const router = Router()

function gerarCodigo(nome) {
  const slug = nome.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').slice(0, 12)
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `${slug}-${rand}`
}

router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body
  const [rows] = await pool.query(
    `SELECT u.*, f.nome AS fazenda_nome, f.codigo_convite
     FROM usuarios u LEFT JOIN fazendas f ON u.fazenda_id = f.id
     WHERE u.usuario = ?`,
    [usuario]
  )
  if (!rows.length) return res.status(401).json({ error: 'Usuário não encontrado' })

  const valid = await bcrypt.compare(senha, rows[0].senha_hash)
  if (!valid) return res.status(401).json({ error: 'Senha incorreta' })

  const { senha_hash, ...user } = rows[0]
  res.json(user)
})

router.post('/register', async (req, res) => {
  const { nome, usuario, senha, email, papel, nome_fazenda, localizacao_fazenda, codigo_convite } = req.body

  if (!nome || !usuario || !senha) {
    return res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios' })
  }

  const [existing] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', [usuario])
  if (existing.length) {
    return res.status(409).json({ error: 'Este usuário já existe' })
  }

  let fazendaId = null

  if (papel === 'admin') {
    if (!nome_fazenda) {
      return res.status(400).json({ error: 'Nome da fazenda é obrigatório para administradores' })
    }
    const codigo = gerarCodigo(nome_fazenda)
    const [fazResult] = await pool.query(
      'INSERT INTO fazendas (nome, localizacao, codigo_convite) VALUES (?, ?, ?)',
      [nome_fazenda, localizacao_fazenda || null, codigo]
    )
    fazendaId = fazResult.insertId
  } else {
    if (!codigo_convite) {
      return res.status(400).json({ error: 'Código de convite é obrigatório para operadores' })
    }
    const [fazendas] = await pool.query('SELECT id FROM fazendas WHERE codigo_convite = ?', [codigo_convite])
    if (!fazendas.length) {
      return res.status(404).json({ error: 'Código de convite inválido' })
    }
    fazendaId = fazendas[0].id
  }

  const hash = await bcrypt.hash(senha, 10)
  const [result] = await pool.query(
    'INSERT INTO usuarios (nome, usuario, senha_hash, email, papel, fazenda_id) VALUES (?, ?, ?, ?, ?, ?)',
    [nome, usuario, hash, email, papel || 'operador', fazendaId]
  )
  res.status(201).json({ id: result.insertId })
})

export default router
