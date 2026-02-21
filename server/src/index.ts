import 'dotenv/config'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { connectDb } from './config/db.js'
import { PORT } from './config/env.js'
import mapsRouter from './routes/maps.js'
import marksRouter from './routes/marks.js'
import albionMapsRouter from './routes/albion-maps.js'
import gameMapsRouter from './routes/game-maps.js'
import markedMapsRouter from './routes/marked-maps.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/maps', mapsRouter)
app.use('/api/marks', marksRouter)
app.use('/api/albion-maps', albionMapsRouter)
app.use('/api/game-maps', gameMapsRouter)
app.use('/api/marked-maps', markedMapsRouter)

/** GET /api/health - server is up and responding */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'albion-map' })
})

/** GET /api/health/db - server + MongoDB connection is ok */
app.get('/api/health/db', async (_req, res) => {
  const readyState = mongoose.connection.readyState
  const connected = readyState === 1
  if (!connected) {
    res.status(503).json({
      status: 'error',
      db: { connected: false, readyState },
      message: 'MongoDB not connected',
    })
    return
  }
  try {
    const db = mongoose.connection.db
    if (!db) throw new Error('DB instance not available')
    await db.admin().ping()
    res.json({
      status: 'ok',
      db: { connected: true, readyState },
    })
  } catch (err) {
    res.status(503).json({
      status: 'error',
      db: { connected: false, readyState },
      message: err instanceof Error ? err.message : 'MongoDB ping failed',
    })
  }
})

// Serve frontend (when built and present, e.g. in Docker)
const publicDir = path.join(__dirname, '..', 'public')
if (existsSync(publicDir)) {
  app.use(express.static(publicDir))
  app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')))
}

function start() {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
  connectDb().catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    console.error('Start MongoDB (e.g. docker run -d -p 27017:27017 mongo:7) and restart the server.')
  })
}

start()
