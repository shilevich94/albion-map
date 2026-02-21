import express from 'express'
import { MarkedMapModel } from '../models/MarkedMap.js'

const router = express.Router()

/** GET /api/marked-maps?q=... - list marked maps, filter by mapName, sort by date desc */
router.get('/', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const filter = q ? { mapName: new RegExp(q, 'i') } : {}
    const list = await MarkedMapModel.find(filter).sort({ updatedAt: -1 }).limit(200).lean()
    res.json(list)
  } catch (err) {
    console.error('Marked maps list error:', err)
    res.status(500).json({ error: 'Failed to list marked maps' })
  }
})

/** GET /api/marked-maps/for-map/:mapId - all marked map documents for this map (all marks from table for this map name) */
router.get('/for-map/:mapId', async (req, res) => {
  try {
    const list = await MarkedMapModel.find({ mapId: req.params.mapId }).sort({ updatedAt: -1 }).lean()
    res.json(list)
  } catch (err) {
    console.error('Marked maps for-map error:', err)
    res.status(500).json({ error: 'Failed to get marked maps for map' })
  }
})

/** POST /api/marked-maps - create a new marked map (allows multiple per mapId) */
router.post('/', async (req, res) => {
  try {
    const { mapId, mapName, imageUrl, marks } = req.body
    if (!mapId || typeof mapName !== 'string') {
      res.status(400).json({ error: 'mapId and mapName are required' })
      return
    }
    const marksArray = Array.isArray(marks)
      ? marks.filter((m: unknown) => typeof m === 'object' && m !== null && 'x' in m && 'y' in m).map((m: { x: number; y: number }) => ({ x: Number(m.x), y: Number(m.y) }))
      : []
    const doc = await MarkedMapModel.create({
      mapId,
      mapName,
      imageUrl: typeof imageUrl === 'string' ? imageUrl : '',
      marks: marksArray,
    })
    res.status(201).json(doc.toObject())
  } catch (err) {
    console.error('Marked map create error:', err)
    res.status(500).json({ error: 'Failed to create marked map' })
  }
})

/** PUT /api/marked-maps/:id - update an existing marked map by document _id */
router.put('/:id', async (req, res) => {
  try {
    const { mapId, mapName, imageUrl, marks } = req.body
    const marksArray = Array.isArray(marks)
      ? marks.filter((m: unknown) => typeof m === 'object' && m !== null && 'x' in m && 'y' in m).map((m: { x: number; y: number }) => ({ x: Number(m.x), y: Number(m.y) }))
      : undefined
    const update: Record<string, unknown> = {}
    if (marksArray !== undefined) update.marks = marksArray
    if (typeof mapName === 'string') update.mapName = mapName
    if (typeof imageUrl === 'string') update.imageUrl = imageUrl
    const doc = await MarkedMapModel.findByIdAndUpdate(req.params.id, update, { new: true }).lean()
    if (!doc) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json(doc)
  } catch (err) {
    console.error('Marked map update error:', err)
    res.status(500).json({ error: 'Failed to update marked map' })
  }
})

/** DELETE /api/marked-maps/:id - delete by document _id */
router.delete('/:id', async (req, res) => {
  try {
    const result = await MarkedMapModel.findByIdAndDelete(req.params.id)
    if (!result) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.status(204).send()
  } catch (err) {
    console.error('Marked map delete error:', err)
    res.status(500).json({ error: 'Failed to delete' })
  }
})

export default router
