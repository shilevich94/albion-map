export const PORT = Number(process.env.PORT) || 4000
export const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/albion-map'

/** Public base URL of this server (e.g. https://api.example.com). When set, API returns absolute image URLs. */
export const BASE_URL = process.env.BASE_URL ?? ''
