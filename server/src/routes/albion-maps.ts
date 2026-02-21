import express from 'express'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ALBION_WORLD_URL =
  'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/world.json'

const CDN_BASE = 'https://cdn.albiononline2d.com/game-images'
const AFM_CDN_BASE = 'https://cdn.albionfreemarket.com/AlbionWorld/map/images'

/** Load JSON mapping (Index -> filename) from server/data. */
function loadJsonMapping(filename: string): Record<string, string> {
  const candidates = [
    path.join(process.cwd(), 'data', filename),
    path.join(__dirname, '..', '..', 'data', filename),
  ]
  for (const dataPath of candidates) {
    if (existsSync(dataPath)) {
      try {
        return JSON.parse(readFileSync(dataPath, 'utf-8'))
      } catch (e) {
        console.error(`Failed to parse ${filename}:`, e)
      }
      break
    }
  }
  return {}
}

const mapImageFilenames = loadJsonMapping('map-image-filenames.json')
const mapImageFilenamesAfm = loadJsonMapping('map-image-filenames-afm.json')

interface WorldEntry {
  Index: string
  UniqueName: string
}

let cachedMaps: WorldEntry[] | null = null

async function fetchWorldMaps(): Promise<WorldEntry[]> {
  if (cachedMaps) return cachedMaps
  const res = await fetch(ALBION_WORLD_URL)
  const data = (await res.json()) as WorldEntry[]
  cachedMaps = data.filter((e) => /^\d{4}$/.test(e.Index))
  return cachedMaps
}

const router: express.Router = express.Router()

function getMapPageUrl(index: string): string {
  return `https://albiononline2d.com/en/map/${index}`
}

/** Resolve CDN image filename for a cluster Index (albiononline2d). */
function getMapImageFileName(index: string): string | null {
  return mapImageFilenames[index] ?? null
}

/** Direct image URL for a cluster Index. Only Albion Free Market CDN (no albiononline2d fallback). */
function getDirectImageUrl(index: string): string | null {
  const afmFileName = mapImageFilenamesAfm[index]
  if (!afmFileName) return null
  return `${AFM_CDN_BASE}/${afmFileName}`
}

/** Proxy image from CDN so the browser gets it from our origin (avoids hotlink/referrer blocking). */
router.get('/image/:index', async (req, res) => {
  const index = req.params.index
  const fileName = getMapImageFileName(index)
  if (!fileName) {
    res.status(404).setHeader('Content-Type', 'application/json').json({ error: 'No image mapping for this map' })
    return
  }
  try {
    const url = `${CDN_BASE}/${fileName}`
    const imgRes = await fetch(url, {
      headers: {
        Accept: 'image/png,image/*;q=0.8',
        Referer: 'https://albiononline2d.com/',
        Origin: 'https://albiononline2d.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    if (!imgRes.ok) {
      console.error('CDN image fetch failed:', imgRes.status, url)
      res.status(502).setHeader('Content-Type', 'application/json').json({
        error: 'Image unavailable',
        details: `CDN returned ${imgRes.status}`,
      })
      return
    }
    const contentType = (imgRes.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
    if (contentType === 'image/svg+xml' || !contentType.startsWith('image/')) {
      console.error('CDN returned non-image or placeholder SVG:', contentType, url)
      res.status(502).setHeader('Content-Type', 'application/json').json({
        error: 'Image unavailable',
        details: 'CDN did not return a PNG image',
      })
      return
    }
    const buf = await imgRes.arrayBuffer()
    const bytes = new Uint8Array(buf)
    if (bytes.length >= 5 && bytes[0] === 0x3c && bytes[1] === 0x73 && bytes[2] === 0x76 && bytes[3] === 0x67) {
      res.status(502).setHeader('Content-Type', 'application/json').json({
        error: 'Image unavailable',
        details: 'CDN returned placeholder SVG',
      })
      return
    }
    res.setHeader('Content-Type', contentType || 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(Buffer.from(buf))
  } catch (err) {
    console.error('Image proxy error:', err)
    res.status(502).setHeader('Content-Type', 'application/json').json({ error: 'Failed to load image' })
  }
})

router.get('/', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''
    const maps = await fetchWorldMaps()
    const filtered = q
      ? maps.filter((m) => m.UniqueName.toLowerCase().includes(q))
      : maps
    const result = filtered.slice(0, 100).map((m) => {
      const imageUrl = getDirectImageUrl(m.Index)
      return {
        index: m.Index,
        name: m.UniqueName,
        imageUrl,
        mapPageUrl: getMapPageUrl(m.Index),
      }
    })
    res.json(result)
  } catch (err) {
    console.error('Albion maps fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch maps' })
  }
})

export default router
