import { Router } from 'express'
import pool from '../db.js'

const router = Router()

const VALID_SORTS = {
  brinco: 'brinco', raca: 'raca', sexo: 'sexo',
  idade: 'data_nascimento', lote: 'lote_nome',
  peso: 'peso_atual', situacao: 'situacao',
}

const IDADE_SQL = {
  '0-6': 'TIMESTAMPDIFF(MONTH, a.data_nascimento, CURDATE()) <= 6',
  '6-12': 'TIMESTAMPDIFF(MONTH, a.data_nascimento, CURDATE()) BETWEEN 7 AND 12',
  '12-24': 'TIMESTAMPDIFF(MONTH, a.data_nascimento, CURDATE()) BETWEEN 13 AND 24',
  '24-48': 'TIMESTAMPDIFF(MONTH, a.data_nascimento, CURDATE()) BETWEEN 25 AND 48',
  '48+': 'TIMESTAMPDIFF(MONTH, a.data_nascimento, CURDATE()) > 48',
}

router.get('/', async (req, res) => {
  const { lote, sexo, situacao, busca, peso_min, peso_max, idade, page, limit, sort, sort_dir } = req.query

  const sortCol = VALID_SORTS[sort] || 'brinco'
  const sortDir = sort_dir === 'desc' ? 'DESC' : 'ASC'

  let innerSql = `
    SELECT a.*, l.nome AS lote_nome,
      (SELECT p.peso_kg FROM pesagens p WHERE p.animal_id = a.id ORDER BY p.data DESC LIMIT 1) AS peso_atual,
      (SELECT p.data FROM pesagens p WHERE p.animal_id = a.id ORDER BY p.data DESC LIMIT 1) AS ultima_pesagem
    FROM animais a
    LEFT JOIN lotes l ON a.lote_id = l.id
    WHERE a.fazenda_id = ?
  `
  const innerParams = [req.fazendaId]

  if (lote) { innerSql += ' AND l.nome = ?'; innerParams.push(lote) }
  if (sexo) { innerSql += ' AND a.sexo = ?'; innerParams.push(sexo) }
  if (situacao) { innerSql += ' AND a.situacao = ?'; innerParams.push(situacao) }
  if (busca) {
    innerSql += ' AND (a.brinco LIKE ? OR a.raca LIKE ? OR l.nome LIKE ?)'
    innerParams.push(`%${busca}%`, `%${busca}%`, `%${busca}%`)
  }
  if (idade && IDADE_SQL[idade]) innerSql += ` AND ${IDADE_SQL[idade]}`

  const outerWhere = []
  const outerParams = []
  if (peso_min) { outerWhere.push('peso_atual >= ?'); outerParams.push(parseFloat(peso_min)) }
  if (peso_max) { outerWhere.push('peso_atual <= ?'); outerParams.push(parseFloat(peso_max)) }

  let sql = `SELECT * FROM (${innerSql}) AS sub`
  if (outerWhere.length) sql += ` WHERE ${outerWhere.join(' AND ')}`

  if (page) {
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(parseInt(limit) || 50, 200)
    const offset = (pageNum - 1) * limitNum

    const countParams = [...innerParams, ...outerParams]
    let countSql = `SELECT COUNT(*) as total FROM (${innerSql}) AS sub`
    if (outerWhere.length) countSql += ` WHERE ${outerWhere.join(' AND ')}`
    const [[{ total }]] = await pool.query(countSql, countParams)

    sql += ` ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`
    const [rows] = await pool.query(sql, [...innerParams, ...outerParams, limitNum, offset])
    return res.json({ animais: rows, total, page: pageNum, totalPaginas: Math.ceil(total / limitNum) })
  }

  sql += ` ORDER BY ${sortCol} ${sortDir}`
  const [rows] = await pool.query(sql, [...innerParams, ...outerParams])
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.*, l.nome AS lote_nome
    FROM animais a LEFT JOIN lotes l ON a.lote_id = l.id
    WHERE a.id = ? AND a.fazenda_id = ?
  `, [req.params.id, req.fazendaId])
  if (!rows.length) return res.status(404).json({ error: 'Animal não encontrado' })
  res.json(rows[0])
})

router.get('/:id/pesagens', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT p.* FROM pesagens p INNER JOIN animais a ON p.animal_id = a.id WHERE p.animal_id = ? AND a.fazenda_id = ? ORDER BY p.data DESC',
    [req.params.id, req.fazendaId]
  )
  res.json(rows)
})

router.get('/:id/historico', async (req, res) => {
  const id = req.params.id
  const [pesagens] = await pool.query(
    `SELECT 'pesagem' as tipo, p.data, CONCAT(p.peso_kg, ' kg') as valor, p.local as detalhe
     FROM pesagens p INNER JOIN animais a ON p.animal_id = a.id
     WHERE p.animal_id = ? AND a.fazenda_id = ? ORDER BY p.data DESC LIMIT 10`, [id, req.fazendaId]
  )
  const [eventos] = await pool.query(
    `SELECT 'sanitario' as tipo, e.data, e.produto as valor, e.tipo as detalhe
     FROM eventos_sanitarios e
     WHERE (e.animal_id = ? OR (e.aplicado_em = 'lote' AND e.lote_id = (SELECT lote_id FROM animais WHERE id = ? AND fazenda_id = ?)))
     ORDER BY e.data DESC LIMIT 10`, [id, id, req.fazendaId]
  )
  const [movs] = await pool.query(
    `SELECT 'lote' as tipo, m.data, CONCAT(lo.nome, ' → ', ld.nome) as valor, m.motivo as detalhe
     FROM movimentacoes_lote m
     INNER JOIN animais a ON m.animal_id = a.id
     LEFT JOIN lotes lo ON m.lote_origem_id = lo.id
     LEFT JOIN lotes ld ON m.lote_destino_id = ld.id
     WHERE m.animal_id = ? AND a.fazenda_id = ? ORDER BY m.data DESC LIMIT 10`, [id, req.fazendaId]
  )
  const [coberturas] = await pool.query(
    `SELECT 'reproducao' as tipo, c.data_cobertura as data,
       CONCAT(c.metodo, ' · ', COALESCE(c.touro_info, '')) as valor,
       c.status as detalhe
     FROM coberturas c INNER JOIN animais a ON c.femea_id = a.id
     WHERE c.femea_id = ? AND a.fazenda_id = ? ORDER BY c.data_cobertura DESC LIMIT 10`, [id, req.fazendaId]
  )
  const [custos] = await pool.query(
    `SELECT 'financeiro' as tipo, lf.data,
       CONCAT('R$ ', ABS(lf.valor)) as valor,
       COALESCE(lf.descricao, lf.categoria) as detalhe
     FROM lancamentos_financeiros lf
     WHERE lf.animal_id = ? AND lf.lancamento_pai_id IS NULL
     ORDER BY lf.data DESC LIMIT 10`, [id]
  )
  const hist = [...pesagens, ...eventos, ...movs, ...coberturas, ...custos].sort((a, b) => b.data.localeCompare?.(a.data) || 0)
  res.json(hist)
})

router.get('/:id/genealogia', async (req, res) => {
  const id = req.params.id
  const [[animal]] = await pool.query(
    'SELECT mae_id, pai_id FROM animais WHERE id = ? AND fazenda_id = ?',
    [id, req.fazendaId]
  )
  if (!animal) return res.status(404).json({ error: 'Animal não encontrado' })

  let mae = null, pai = null
  if (animal.mae_id) {
    const [r] = await pool.query(
      'SELECT id, brinco, raca, sexo, situacao FROM animais WHERE id = ? AND fazenda_id = ?',
      [animal.mae_id, req.fazendaId]
    )
    if (r.length) mae = r[0]
  }
  if (animal.pai_id) {
    const [r] = await pool.query(
      'SELECT id, brinco, raca, sexo, situacao FROM animais WHERE id = ? AND fazenda_id = ?',
      [animal.pai_id, req.fazendaId]
    )
    if (r.length) pai = r[0]
  }

  const [filhosMae] = await pool.query(
    'SELECT id, brinco, raca, sexo, situacao FROM animais WHERE mae_id = ? AND fazenda_id = ?',
    [id, req.fazendaId]
  )
  const [filhosPai] = await pool.query(
    'SELECT id, brinco, raca, sexo, situacao FROM animais WHERE pai_id = ? AND fazenda_id = ?',
    [id, req.fazendaId]
  )
  const filhos = [...filhosMae, ...filhosPai].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)

  res.json({ mae, pai, filhos })
})

router.get('/:id/custos', async (req, res) => {
  const id = req.params.id
  const [rows] = await pool.query(
    `SELECT lf.id, lf.categoria, lf.descricao, ABS(lf.valor) as valor, lf.data
     FROM lancamentos_financeiros lf
     INNER JOIN animais a ON (lf.animal_id = a.id OR (lf.escopo = 'lote' AND lf.lote_id = a.lote_id AND lf.lancamento_pai_id IS NULL))
     WHERE a.id = ? AND a.fazenda_id = ? AND lf.valor < 0
     ORDER BY lf.data DESC LIMIT 20`,
    [id, req.fazendaId]
  )
  const [[total]] = await pool.query(
    `SELECT COALESCE(SUM(ABS(lf.valor)), 0) as total
     FROM lancamentos_financeiros lf
     INNER JOIN animais a ON lf.animal_id = a.id
     WHERE a.id = ? AND a.fazenda_id = ? AND lf.valor < 0`,
    [id, req.fazendaId]
  )
  res.json({ custos: rows, total: parseFloat(total.total) })
})

router.get('/:id/reproducao', async (req, res) => {
  const id = req.params.id
  const [coberturas] = await pool.query(
    `SELECT c.*, t.brinco as touro_brinco
     FROM coberturas c
     INNER JOIN animais f ON c.femea_id = f.id
     LEFT JOIN animais t ON t.brinco = c.touro_info
     WHERE c.femea_id = ? AND f.fazenda_id = ?
     ORDER BY c.data_cobertura DESC`,
    [id, req.fazendaId]
  )
  const [[filhos]] = await pool.query(
    'SELECT COUNT(*) as total FROM animais WHERE mae_id = ? AND fazenda_id = ?', [id, req.fazendaId]
  )
  res.json({ coberturas, total_crias: filhos.total })
})

router.post('/', async (req, res) => {
  const { brinco, sexo, raca, data_nascimento, origem, lote_id, sisbov } = req.body
  const [result] = await pool.query(
    'INSERT INTO animais (brinco, sexo, raca, data_nascimento, origem, lote_id, sisbov, fazenda_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [brinco, sexo, raca, data_nascimento, origem || 'nascido_aqui', lote_id, sisbov, req.fazendaId]
  )
  res.status(201).json({ id: result.insertId })
})

router.put('/:id', async (req, res) => {
  const { brinco, sexo, raca, data_nascimento, origem, lote_id, situacao, sisbov, mae_id, pai_id } = req.body
  await pool.query(
    'UPDATE animais SET brinco=?, sexo=?, raca=?, data_nascimento=?, origem=?, lote_id=?, situacao=?, sisbov=?, mae_id=?, pai_id=? WHERE id=? AND fazenda_id=?',
    [brinco, sexo, raca, data_nascimento, origem, lote_id, situacao, sisbov, mae_id || null, pai_id || null, req.params.id, req.fazendaId]
  )
  res.json({ ok: true })
})

router.post('/:id/pesagens', async (req, res) => {
  const { peso_kg, data, local, observacao } = req.body
  const [animal] = await pool.query('SELECT id FROM animais WHERE id = ? AND fazenda_id = ?', [req.params.id, req.fazendaId])
  if (!animal.length) return res.status(404).json({ error: 'Animal não encontrado' })
  const [result] = await pool.query(
    'INSERT INTO pesagens (animal_id, peso_kg, data, local, observacao) VALUES (?, ?, ?, ?, ?)',
    [req.params.id, peso_kg, data, local, observacao]
  )
  res.status(201).json({ id: result.insertId })
})

router.post('/:id/mover', async (req, res) => {
  const { lote_destino_id, motivo, data } = req.body
  const [animal] = await pool.query('SELECT lote_id FROM animais WHERE id = ? AND fazenda_id = ?', [req.params.id, req.fazendaId])
  if (!animal.length) return res.status(404).json({ error: 'Animal não encontrado' })

  await pool.query(
    'INSERT INTO movimentacoes_lote (animal_id, lote_origem_id, lote_destino_id, motivo, data) VALUES (?, ?, ?, ?, ?)',
    [req.params.id, animal[0].lote_id, lote_destino_id, motivo, data]
  )
  await pool.query('UPDATE animais SET lote_id = ? WHERE id = ? AND fazenda_id = ?', [lote_destino_id, req.params.id, req.fazendaId])
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM animais WHERE id = ? AND fazenda_id = ?', [req.params.id, req.fazendaId])
  res.json({ ok: true })
})

export default router
