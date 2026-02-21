import express from 'express'
import { MarkModel } from '../models/Mark.js'

const router: express.Router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { mapId } = req.query
    const filter = mapId ? { mapId } : {}
    const marks = await MarkModel.find(filter).lean()
    res.json(marks)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch marks' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { mapId, x, y, label } = req.body
    if (!mapId || typeof x !== 'number' || typeof y !== 'number' || !label) {
      res.status(400).json({ error: 'mapId, x, y, and label are required' })
      return
    }
    const mark = await MarkModel.create({ mapId, x, y, label })
    res.status(201).json(mark)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create mark' })
  }
})

export default router
