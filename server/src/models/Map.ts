import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IMap extends Document {
  name: string
  createdAt: Date
}

const MapSchema = new Schema<IMap>(
  {
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const MapModel: Model<IMap> =
  mongoose.models.Map ?? mongoose.model<IMap>('Map', MapSchema)
