import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pool from './db.js'

async function seed() {
  console.log('Limpando tabelas...')
  await pool.query('SET FOREIGN_KEY_CHECKS = 0')
  for (const t of ['alertas','lancamentos_financeiros','movimentacoes_lote','coberturas','eventos_sanitarios','pesagens','animais','lotes','usuarios','fazendas']) {
    await pool.query(`TRUNCATE TABLE ${t}`)
  }
  await pool.query('SET FOREIGN_KEY_CHECKS = 1')

  console.log('Criando fazenda...')
  const [fazResult] = await pool.query(
    'INSERT INTO fazendas (nome, localizacao, codigo_convite) VALUES (?, ?, ?)',
    ['Fazenda Santa Rita', 'Uberaba, MG', 'SANTA-RITA-4X7K']
  )
  const fazendaId = fazResult.insertId

  console.log('Criando usuário admin...')
  const hash = await bcrypt.hash('123456', 10)
  await pool.query(
    'INSERT INTO usuarios (nome, usuario, senha_hash, email, papel, fazenda_id) VALUES (?, ?, ?, ?, ?, ?)',
    ['João Carlos', 'joao.carlos', hash, 'joao@fazenda.com', 'admin', fazendaId]
  )

  console.log('Criando lotes...')
  const lotesData = [
    ['Pasto 1', 'pasto', 42, 100],
    ['Pasto 2', 'pasto', 38, 90],
    ['Pasto 3', 'pasto', 30, 80],
    ['Maternidade', 'maternidade', 5, 20],
    ['Curral', 'curral', null, null],
    ['Quarentena', 'pasto', 10, 30],
  ]
  const loteIds = {}
  for (const [nome, tipo, area, cap] of lotesData) {
    const [r] = await pool.query('INSERT INTO lotes (nome, tipo, area_ha, capacidade, fazenda_id) VALUES (?, ?, ?, ?, ?)', [nome, tipo, area, cap, fazendaId])
    loteIds[nome] = r.insertId
  }

  console.log('Criando animais...')
  const animaisData = [
    ['0427', 'Fêmea', 'Nelore', '2023-04-12', 'nascido_aqui', 'Pasto 3', 'ativo'],
    ['0915', 'Fêmea', 'Nelore', '2022-05-20', 'nascido_aqui', 'Pasto 3', 'prenhe'],
    ['1138', 'Macho', 'Angus', '2024-06-15', 'comprado', 'Pasto 1', 'ativo'],
    ['0822', 'Fêmea', 'Nelore', '2021-03-08', 'nascido_aqui', 'Curral', 'ativo'],
    ['0428', 'Fêmea', 'Nelore', '2026-03-18', 'nascido_aqui', 'Maternidade', 'ativo'],
    ['0560', 'Fêmea', 'Nelore', '2020-06-24', 'comprado', 'Quarentena', 'quarentena'],
    ['0631', 'Macho', 'Brahman', '2022-12-10', 'comprado', 'Pasto 1', 'ativo'],
    ['1204', 'Fêmea', 'Girolando', '2024-02-14', 'nascido_aqui', 'Pasto 1', 'ativo'],
    ['0488', 'Fêmea', 'Nelore', '2023-08-02', 'nascido_aqui', 'Pasto 3', 'ativo'],
    ['0502', 'Macho', 'Angus', '2023-01-20', 'comprado', 'Pasto 3', 'ativo'],
    ['0533', 'Fêmea', 'Nelore', '2023-06-11', 'nascido_aqui', 'Pasto 3', 'ativo'],
    ['0571', 'Fêmea', 'Nelore', '2023-02-28', 'nascido_aqui', 'Pasto 3', 'ativo'],
  ]
  const animalIds = {}
  for (const [brinco, sexo, raca, nasc, origem, lote, situacao] of animaisData) {
    const [r] = await pool.query(
      'INSERT INTO animais (brinco, sexo, raca, data_nascimento, origem, lote_id, situacao, fazenda_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [brinco, sexo, raca, nasc, origem, loteIds[lote], situacao, fazendaId]
    )
    animalIds[brinco] = r.insertId
  }

  console.log('Criando pesagens...')
  const pesagens = [
    ['0427', '2026-01-15', 370], ['0427', '2026-02-12', 382], ['0427', '2026-03-12', 394],
    ['0427', '2026-04-12', 406], ['0427', '2026-05-12', 418],
    ['0915', '2026-03-10', 478], ['0915', '2026-05-10', 502],
    ['1138', '2026-05-12', 465], ['0822', '2026-05-12', 530],
    ['0428', '2026-06-01', 96], ['0560', '2026-05-12', 545],
    ['0631', '2026-05-12', 540], ['1204', '2026-05-12', 410],
    ['0488', '2026-05-10', 395], ['0502', '2026-05-12', 470],
    ['0533', '2026-05-10', 410], ['0571', '2026-05-12', 388],
  ]
  for (const [brinco, data, peso] of pesagens) {
    await pool.query(
      'INSERT INTO pesagens (animal_id, peso_kg, data, local) VALUES (?, ?, ?, ?)',
      [animalIds[brinco], peso, data, 'curral']
    )
  }

  console.log('Criando eventos sanitários...')
  await pool.query(
    'INSERT INTO eventos_sanitarios (tipo, aplicado_em, lote_id, produto, dose, data, data_proxima_dose, responsavel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['vacina', 'lote', loteIds['Pasto 3'], 'Aftosa – Bovis', '5 ml', '2026-03-21', '2026-06-21', 'João Carlos']
  )
  await pool.query(
    'INSERT INTO eventos_sanitarios (tipo, aplicado_em, lote_id, produto, dose, data, data_proxima_dose, responsavel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['vacina', 'lote', loteIds['Pasto 1'], 'Aftosa – Bovis', '5 ml', '2026-05-12', '2026-11-12', 'João Carlos']
  )
  await pool.query(
    'INSERT INTO eventos_sanitarios (tipo, aplicado_em, lote_id, produto, dose, data, data_proxima_dose, responsavel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['vermifugo', 'lote', loteIds['Curral'], 'Ivermectina 1%', '10 ml', '2026-04-20', '2026-06-26', 'João Carlos']
  )

  console.log('Criando coberturas...')
  const coberturasData = [
    [animalIds['0915'], 'IA', 'Sêmen Nelore Elite', '2025-09-25', '2026-07-05', 'parto_proximo'],
    [animalIds['0822'], 'monta', '0631 · Brahman', '2025-11-04', '2026-08-14', 'confirmada'],
    [animalIds['1204'], 'IA', 'Sêmen Gir Leiteiro', '2026-06-02', '2027-03-12', 'aguardando'],
    [animalIds['0560'], 'monta', '0631 · Brahman', '2025-11-23', '2026-09-02', 'confirmada'],
  ]
  for (const [fid, met, touro, dc, dp, st] of coberturasData) {
    await pool.query(
      'INSERT INTO coberturas (femea_id, metodo, touro_info, data_cobertura, data_prevista_parto, status) VALUES (?, ?, ?, ?, ?, ?)',
      [fid, met, touro, dc, dp, st]
    )
  }

  console.log('Criando lançamentos financeiros...')
  const lancs = [
    ['geral', null, null, 'venda', 'Venda de gado', 64000, '2026-06-18', 'Venda · 6 bois'],
    ['geral', null, null, 'venda', 'Venda de gado', 48000, '2026-06-12', 'Venda · 4 novilhas'],
    ['geral', null, null, 'custo', 'Ração & suplemento', -7000, '2026-06-08', 'Ração · 80 sacas'],
    ['geral', null, null, 'compra', 'Compra de animais', -18000, '2026-06-04', 'Compra · 2 touros'],
    ['geral', null, null, 'custo', 'Mão de obra', -4500, '2026-06-01', 'Salário peão — junho'],
    ['geral', null, null, 'custo', 'Medicamento / tratamento', -2500, '2026-05-28', 'Medicamentos'],
  ]
  for (const [escopo, lote, animal, tipo, cat, val, data, desc] of lancs) {
    await pool.query(
      'INSERT INTO lancamentos_financeiros (escopo, lote_id, animal_id, tipo, categoria, valor, data, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [escopo, lote, animal, tipo, cat, val, data, desc]
    )
  }

  console.log('Seed concluído!')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
