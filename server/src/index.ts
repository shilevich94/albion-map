import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDb } from './config/db.js'
import { PORT } from './config/env.js'
import mapsRouter from './routes/maps.js'
import marksRouter from './routes/marks.js'
import albionMapsRouter from './routes/albion-maps.js'
import gameMapsRouter from './routes/game-maps.js'
import markedMapsRouter from './routes/marked-maps.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/maps', mapsRouter)
app.use('/api/marks', marksRouter)
app.use('/api/albion-maps', albionMapsRouter)
app.use('/api/game-maps', gameMapsRouter)
app.use('/api/marked-maps', markedMapsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

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
