import express, { type Router } from 'express'
import { GameMapModel } from '../models/GameMap.js'

const router: Router = express.Router()
const AFM_CDN_BASE = 'https://cdn.albionfreemarket.com/AlbionWorld/map/images'

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toImageUrl(imageFile: string): string {
  const file = imageFile.endsWith('.png') ? imageFile.slice(0, -4) + '.webp' : imageFile
  return `${AFM_CDN_BASE}/${file}`
}

/**
 * GET /api/game-maps/search?q=...
 * Search open-world black zone maps by displayName.
 * Query can be multiple space-separated tokens; each token must match a word (or word start).
 * e.g. "Ra Ch" or "ra ch" matches "Razorrock Chasm".
 */
router.get('/search', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''
    const tokens = q.split(/\s+/).filter(Boolean)
    if (tokens.length === 0) {
      res.json([])
      return
    }
    const andConditions = tokens.map((token) => ({
      displayName: new RegExp(`\\b${escapeRegex(token)}`, 'i'),
    }))
    const docs = await GameMapModel.find({
      pvpCategory: 'black',
      mapCategory: 'openworld',
      $and: andConditions,
    })
      .limit(100)
      .lean()

    const results = docs.map((m) => ({
      index: m.id,
      name: m.displayName,
      imageUrl: toImageUrl(m.imageFile),
      mapPageUrl: `https://albiononline2d.com/en/map/${m.id}`,
    }))
    res.json(results)
  } catch (err) {
    console.error('Game maps search error:', err)
    res.status(500).json({ error: 'Failed to search maps' })
  }
})

export default router
