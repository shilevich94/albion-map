export interface MarkPosition {
  x: number
  y: number
}

export interface MarkedMap {
  _id: string
  mapId: string
  mapName: string
  imageUrl: string
  marks: MarkPosition[]
  createdAt: string | null
  updatedAt: string | null
}
