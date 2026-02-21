import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IMarkPosition {
  x: number
  y: number
}

export interface IMarkedMap extends Document {
  mapId: string
  mapName: string
  imageUrl: string
  marks: IMarkPosition[]
  createdAt: Date
  updatedAt: Date
}

const MarkPositionSchema = new Schema<IMarkPosition>(
  { x: { type: Number, required: true }, y: { type: Number, required: true } },
  { _id: false }
)

// Marked maps table: multiple rows per map allowed (same map name, different marks or count).
const MarkedMapSchema = new Schema<IMarkedMap>(
  {
    mapId: { type: String, required: true }, // no unique: multiple entries per map
    mapName: { type: String, required: true },
    imageUrl: { type: String, required: true, default: '' },
    marks: { type: [MarkPositionSchema], default: [] },
  },
  { timestamps: true }
)

MarkedMapSchema.index({ mapName: 'text' })
MarkedMapSchema.index({ createdAt: -1 })

export const MarkedMapModel: Model<IMarkedMap> =
  mongoose.models.MarkedMap ?? mongoose.model<IMarkedMap>('MarkedMap', MarkedMapSchema)
