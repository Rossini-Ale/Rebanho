import { Router } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT c.*, a.brinco, a.raca
    FROM coberturas c
    INNER JOIN animais a ON c.femea_id = a.id
    ORDER BY c.data_prevista_parto
  `)
  res.json(rows)
})

router.get('/stats', async (req, res) => {
  const [[totalFemeas]] = await pool.query("SELECT COUNT(*) as total FROM animais WHERE sexo = 'Fêmea' AND situacao != 'vendido'")
  const [[prenhes]] = await pool.query("SELECT COUNT(*) as total FROM animais WHERE situacao = 'prenhe'")
  const [[partos30d]] = await pool.query(`
    SELECT COUNT(*) as total FROM coberturas
    WHERE status IN ('parto_proximo','confirmada') AND data_prevista_parto IS NOT NULL
      AND data_prevista_parto BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  `)
  const [[partosSemana]] = await pool.query(`
    SELECT COUNT(*) as total FROM coberturas
    WHERE status IN ('parto_proximo','confirmada') AND data_prevista_parto IS NOT NULL
      AND data_prevista_parto BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  `)
  const [[nascimentosAno]] = await pool.query(`
    SELECT COUNT(*) as total FROM coberturas
    WHERE status = 'concluida' AND YEAR(data_parto) = YEAR(CURDATE())
  `)
  const [[nascimentosAnoPassado]] = await pool.query(`
    SELECT COUNT(*) as total FROM coberturas
    WHERE status = 'concluida' AND YEAR(data_parto) = YEAR(CURDATE()) - 1
  `)
  const taxa = totalFemeas.total > 0 ? Math.round((prenhes.total / totalFemeas.total) * 100) : 0
  res.json({
    total_femeas: totalFemeas.total,
    prenhes: prenhes.total,
    taxa_prenhez: taxa,
    partos_30d: partos30d.total,
    partos_semana: partosSemana.total,
    nascimentos_ano: nascimentosAno.total,
    diff_nascimentos: nascimentosAno.total - nascimentosAnoPassado.total,
  })
})

router.post('/cobertura', async (req, res) => {
  const { femea_id, metodo, touro_info, data_cobertura } = req.body
  const dataPrevParto = new Date(new Date(data_cobertura).getTime() + 283 * 86400000).toISOString().slice(0, 10)

  const [result] = await pool.query(
    'INSERT INTO coberturas (femea_id, metodo, touro_info, data_cobertura, data_prevista_parto) VALUES (?, ?, ?, ?, ?)',
    [femea_id, metodo, touro_info, data_cobertura, dataPrevParto]
  )
  await pool.query('UPDATE animais SET situacao = "prenhe" WHERE id = ?', [femea_id])
  res.status(201).json({ id: result.insertId, data_prevista_parto: dataPrevParto })
})

router.post('/parto', async (req, res) => {
  const { cobertura_id, femea_id, data_parto, bezerro_situacao, bezerro_sexo, bezerro_peso, bezerro_brinco } = req.body

  let bezerroId = null
  if (bezerro_situacao === 'vivo' && bezerro_brinco) {
    const [maternidade] = await pool.query("SELECT id FROM lotes WHERE tipo = 'maternidade' LIMIT 1")
    const loteMatId = maternidade.length ? maternidade[0].id : null

    const [result] = await pool.query(
      'INSERT INTO animais (brinco, sexo, raca, data_nascimento, origem, mae_id, lote_id) VALUES (?, ?, (SELECT raca FROM animais WHERE id = ?), ?, "nascido_aqui", ?, ?)',
      [bezerro_brinco, bezerro_sexo, femea_id, data_parto, femea_id, loteMatId]
    )
    bezerroId = result.insertId

    if (bezerro_peso) {
      await pool.query(
        'INSERT INTO pesagens (animal_id, peso_kg, data, local) VALUES (?, ?, ?, "maternidade")',
        [bezerroId, bezerro_peso, data_parto]
      )
    }
  }

  if (cobertura_id) {
    await pool.query(
      'UPDATE coberturas SET status = "concluida", data_parto = ?, bezerro_id = ?, bezerro_situacao = ? WHERE id = ?',
      [data_parto, bezerroId, bezerro_situacao, cobertura_id]
    )
  }

  await pool.query('UPDATE animais SET situacao = "ativo" WHERE id = ?', [femea_id])

  res.status(201).json({ ok: true, bezerro_id: bezerroId })
})

export default router
