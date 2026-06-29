import 'dotenv/config'
import pool from './db.js'

async function migrate() {
  console.log('Criando tabela fazendas...')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fazendas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      localizacao VARCHAR(200),
      codigo_convite VARCHAR(20) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('Adicionando fazenda_id em usuarios...')
  const [cols] = await pool.query(`SHOW COLUMNS FROM usuarios LIKE 'fazenda_id'`)
  if (!cols.length) {
    await pool.query(`ALTER TABLE usuarios ADD COLUMN fazenda_id INT, ADD FOREIGN KEY (fazenda_id) REFERENCES fazendas(id)`)
  }

  console.log('Adicionando fazenda_id em lotes...')
  const [loteCols] = await pool.query(`SHOW COLUMNS FROM lotes LIKE 'fazenda_id'`)
  if (!loteCols.length) {
    await pool.query(`ALTER TABLE lotes ADD COLUMN fazenda_id INT, ADD FOREIGN KEY (fazenda_id) REFERENCES fazendas(id)`)
  }

  console.log('Adicionando fazenda_id em animais...')
  const [animalCols] = await pool.query(`SHOW COLUMNS FROM animais LIKE 'fazenda_id'`)
  if (!animalCols.length) {
    await pool.query(`ALTER TABLE animais ADD COLUMN fazenda_id INT, ADD FOREIGN KEY (fazenda_id) REFERENCES fazendas(id)`)
  }

  console.log('Migração concluída!')
  process.exit(0)
}

migrate().catch(err => { console.error(err); process.exit(1) })
