import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IGameMap extends Document {
  id: string
  displayName: string
  imageFile: string
  pvpCategory: string
  mapCategory: string
}

const GameMapSchema = new Schema<IGameMap>(
  {
    id: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    imageFile: { type: String, required: true },
    pvpCategory: { type: String, required: true },
    mapCategory: { type: String, required: true },
  },
  { timestamps: false }
)

GameMapSchema.index({ displayName: 'text' })
GameMapSchema.index({ pvpCategory: 1, mapCategory: 1 })

export const GameMapModel: Model<IGameMap> =
  mongoose.models.GameMap ?? mongoose.model<IGameMap>('GameMap', GameMapSchema)
