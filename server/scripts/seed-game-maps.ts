/**
 * Seed game maps from client/src/shared/maps.json into MongoDB.
 * Run from server dir: cd server && npm run seed:game-maps
 * Loads MONGODB_URI from server/.env if present.
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { GameMapModel } from '../src/models/GameMap.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/albion-map'

interface MapEntry {
  id: string
  displayName: string
  imageFile?: string | null
  pvpCategory?: string | null
  mapCategory?: string | null
}

const candidates = [
  path.join(__dirname, '../../client/src/shared/maps.json'),
  path.join(__dirname, '../data/maps.json'),
  path.join(process.cwd(), 'data/maps.json'),
]

function loadMapsJson(): MapEntry[] {
  for (const p of candidates) {
    if (existsSync(p)) {
      const raw = readFileSync(p, 'utf-8')
      return JSON.parse(raw) as MapEntry[]
    }
  }
  throw new Error(
    `maps.json not found. Tried: ${candidates.join(', ')}. Copy client/src/shared/maps.json to server/data/maps.json or run from monorepo root.`
  )
}

async function seed() {
  const maps = loadMapsJson()
  const toInsert = maps.filter(
    (m): m is MapEntry & { imageFile: string } =>
      Boolean(
        m.id &&
          m.displayName &&
          m.imageFile &&
          m.pvpCategory === 'black' &&
          m.mapCategory === 'openworld'
      )
  )

  const docs = toInsert.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    imageFile: m.imageFile,
    pvpCategory: m.pvpCategory,
    mapCategory: m.mapCategory,
  }))

  await mongoose.connect(MONGODB_URI)
  await GameMapModel.deleteMany({})
  await GameMapModel.insertMany(docs)
  console.log(`Seeded ${docs.length} game maps (open-world black zone with image).`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
