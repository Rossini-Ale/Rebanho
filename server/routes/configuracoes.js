import { Router } from 'express'
import pool from '../db.js'

const router = Router()

const DEFAULTS = {
  racas: ['Nelore', 'Angus', 'Brahman', 'Girolando', 'Tabapuã', 'Senepol'],
  categorias_custo: ['Mão de obra', 'Ração & suplemento', 'Medicamento / tratamento', 'Manutenção', 'Combustível', 'Outros'],
  produtos_sanitarios: ['Aftosa – Bovis', 'Brucelose – B19', 'Raiva – Agrovet', 'Carbúnculo – Sintovac', 'Ivermectina 1%', 'Albendazol 10%'],
  touros: ['0631 · Brahman', 'Sêmen Nelore Elite', 'Sêmen Gir Leiteiro'],
}

router.get('/:chave', async (req, res) => {
  const fid = req.fazendaId
  const { chave } = req.params

  const [rows] = await pool.query(
    'SELECT valor FROM configuracoes WHERE fazenda_id = ? AND chave = ?',
    [fid, chave]
  )

  if (rows.length > 0) {
    const valor = typeof rows[0].valor === 'string' ? JSON.parse(rows[0].valor) : rows[0].valor
    return res.json({ chave, valor })
  }

  res.json({ chave, valor: DEFAULTS[chave] || [] })
})

router.put('/:chave', async (req, res) => {
  const fid = req.fazendaId
  const { chave } = req.params
  const { valor } = req.body

  await pool.query(
    'INSERT INTO configuracoes (fazenda_id, chave, valor) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
    [fid, chave, JSON.stringify(valor)]
  )

  res.json({ chave, valor })
})

export default router
