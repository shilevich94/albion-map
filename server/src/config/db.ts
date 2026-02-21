import mongoose from 'mongoose'
import { MONGODB_URI } from './env.js'

export async function connectDb(): Promise<void> {
  await mongoose.connect(MONGODB_URI)
  const { host, name } = mongoose.connection
  console.log(`MongoDB connected: ${host} / database: ${name}`)
  // Drop legacy unique index on mapId so multiple marked maps per map are allowed
  try {
    const coll = mongoose.connection.collection('markedmaps')
    await coll.dropIndex('mapId_1')
  } catch {
    // Index may not exist (e.g. new DB or already dropped)
  }
}
