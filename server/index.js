import 'dotenv/config'
import { fileURLToPath } from 'url'
import path from 'path'
import express from 'express'
import cors from 'cors'
import pool from './db.js'
import { fazendaMiddleware } from './middleware.js'
import animaisRouter from './routes/animais.js'
import lotesRouter from './routes/lotes.js'
import sanidadeRouter from './routes/sanidade.js'
import reproducaoRouter from './routes/reproducao.js'
import financeiroRouter from './routes/financeiro.js'
import authRouter from './routes/auth.js'
import dashboardRouter from './routes/dashboard.js'
import fazendasRouter from './routes/fazendas.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())
app.use(fazendaMiddleware)

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'connected' })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
})

app.use('/api/animais', animaisRouter)
app.use('/api/lotes', lotesRouter)
app.use('/api/sanidade', sanidadeRouter)
app.use('/api/reproducao', reproducaoRouter)
app.use('/api/financeiro', financeiroRouter)
app.use('/api/auth', authRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/fazendas', fazendasRouter)

const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`))
