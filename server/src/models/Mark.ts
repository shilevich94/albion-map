import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IMark extends Document {
  mapId: mongoose.Types.ObjectId
  x: number
  y: number
  label: string
  createdAt: Date
}

const MarkSchema = new Schema<IMark>(
  {
    mapId: { type: Schema.Types.ObjectId, ref: 'Map', required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    label: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const MarkModel: Model<IMark> =
  mongoose.models.Mark ?? mongoose.model<IMark>('Mark', MarkSchema)
