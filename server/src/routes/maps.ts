import express from 'express'
import { MapModel } from '../models/Map.js'

const router: express.Router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const maps = await MapModel.find().lean()
    res.json(maps)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maps' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name } = req.body
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' })
      return
    }
    const map = await MapModel.create({ name })
    res.status(201).json(map)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create map' })
  }
})

export default router
