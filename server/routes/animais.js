import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { lote, sexo, situacao, busca } = req.query
  let sql = `
    SELECT a.*, l.nome AS lote_nome,
      (SELECT p.peso_kg FROM pesagens p WHERE p.animal_id = a.id ORDER BY p.data DESC LIMIT 1) AS peso_atual,
      (SELECT p.data FROM pesagens p WHERE p.animal_id = a.id ORDER BY p.data DESC LIMIT 1) AS ultima_pesagem
    FROM animais a
    LEFT JOIN lotes l ON a.lote_id = l.id
    WHERE 1=1
  `
  const params = []
  if (lote) { sql += ' AND l.nome = ?'; params.push(lote) }
  if (sexo) { sql += ' AND a.sexo = ?'; params.push(sexo) }
  if (situacao) { sql += ' AND a.situacao = ?'; params.push(situacao) }
  if (busca) { sql += ' AND a.brinco LIKE ?'; params.push(`%${busca}%`) }
  sql += ' ORDER BY a.brinco'

  const [rows] = await pool.query(sql, params)
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.*, l.nome AS lote_nome
    FROM animais a LEFT JOIN lotes l ON a.lote_id = l.id
    WHERE a.id = ?
  `, [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Animal não encontrado' })
  res.json(rows[0])
})

router.get('/:id/pesagens', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM pesagens WHERE animal_id = ? ORDER BY data DESC', [req.params.id]
  )
  res.json(rows)
})

router.get('/:id/historico', async (req, res) => {
  const id = req.params.id
  const [pesagens] = await pool.query(
    `SELECT 'pesagem' as tipo, data, CONCAT(peso_kg, ' kg') as valor, local as detalhe FROM pesagens WHERE animal_id = ? ORDER BY data DESC LIMIT 10`, [id]
  )
  const [eventos] = await pool.query(
    `SELECT 'sanitario' as tipo, data, produto as valor, tipo as detalhe FROM eventos_sanitarios WHERE animal_id = ? OR (aplicado_em = 'lote' AND lote_id = (SELECT lote_id FROM animais WHERE id = ?)) ORDER BY data DESC LIMIT 10`, [id, id]
  )
  const [movs] = await pool.query(
    `SELECT 'lote' as tipo, data, CONCAT(lo.nome, ' → ', ld.nome) as valor, motivo as detalhe
     FROM movimentacoes_lote m
     LEFT JOIN lotes lo ON m.lote_origem_id = lo.id
     LEFT JOIN lotes ld ON m.lote_destino_id = ld.id
     WHERE m.animal_id = ? ORDER BY data DESC LIMIT 10`, [id]
  )
  const hist = [...pesagens, ...eventos, ...movs].sort((a, b) => b.data.localeCompare?.(a.data) || 0)
  res.json(hist)
})

router.get('/:id/custos', async (req, res) => {
  const id = req.params.id
  const [rows] = await pool.query(
    `SELECT id, categoria, descricao, ABS(valor) as valor, data
     FROM lancamentos_financeiros
     WHERE (animal_id = ? OR (escopo = 'lote' AND lote_id = (SELECT lote_id FROM animais WHERE id = ?) AND lancamento_pai_id IS NULL))
       AND valor < 0
     ORDER BY data DESC LIMIT 20`,
    [id, id]
  )
  const [[total]] = await pool.query(
    `SELECT COALESCE(SUM(ABS(valor)), 0) as total
     FROM lancamentos_financeiros
     WHERE animal_id = ? AND valor < 0`,
    [id]
  )
  res.json({ custos: rows, total: parseFloat(total.total) })
})

router.get('/:id/reproducao', async (req, res) => {
  const id = req.params.id
  const [coberturas] = await pool.query(
    `SELECT c.*, a.brinco as touro_brinco
     FROM coberturas c
     LEFT JOIN animais a ON a.brinco = c.touro_info
     WHERE c.femea_id = ?
     ORDER BY c.data_cobertura DESC`,
    [id]
  )
  const [[filhos]] = await pool.query(
    'SELECT COUNT(*) as total FROM animais WHERE mae_id = ?', [id]
  )
  res.json({ coberturas, total_crias: filhos.total })
})

router.post('/', async (req, res) => {
  const { brinco, sexo, raca, data_nascimento, origem, lote_id, sisbov } = req.body
  const [result] = await pool.query(
    'INSERT INTO animais (brinco, sexo, raca, data_nascimento, origem, lote_id, sisbov) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [brinco, sexo, raca, data_nascimento, origem || 'nascido_aqui', lote_id, sisbov]
  )
  res.status(201).json({ id: result.insertId })
})

router.put('/:id', async (req, res) => {
  const { brinco, sexo, raca, data_nascimento, origem, lote_id, situacao, sisbov } = req.body
  await pool.query(
    'UPDATE animais SET brinco=?, sexo=?, raca=?, data_nascimento=?, origem=?, lote_id=?, situacao=?, sisbov=? WHERE id=?',
    [brinco, sexo, raca, data_nascimento, origem, lote_id, situacao, sisbov, req.params.id]
  )
  res.json({ ok: true })
})

router.post('/:id/pesagens', async (req, res) => {
  const { peso_kg, data, local, observacao } = req.body
  const [result] = await pool.query(
    'INSERT INTO pesagens (animal_id, peso_kg, data, local, observacao) VALUES (?, ?, ?, ?, ?)',
    [req.params.id, peso_kg, data, local, observacao]
  )
  res.status(201).json({ id: result.insertId })
})

router.post('/:id/mover', async (req, res) => {
  const { lote_destino_id, motivo, data } = req.body
  const [animal] = await pool.query('SELECT lote_id FROM animais WHERE id = ?', [req.params.id])
  if (!animal.length) return res.status(404).json({ error: 'Animal não encontrado' })

  await pool.query(
    'INSERT INTO movimentacoes_lote (animal_id, lote_origem_id, lote_destino_id, motivo, data) VALUES (?, ?, ?, ?, ?)',
    [req.params.id, animal[0].lote_id, lote_destino_id, motivo, data]
  )
  await pool.query('UPDATE animais SET lote_id = ? WHERE id = ?', [lote_destino_id, req.params.id])
  res.json({ ok: true })
})

export default router
