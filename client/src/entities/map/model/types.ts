export interface AlbionMap {
  id: string
  name: string
  createdAt: string
}

export interface AlbionMapSearchResult {
  index: string
  name: string
  /** Direct CDN image URL when we have a known filename; null otherwise */
  imageUrl: string | null
  mapPageUrl: string
}
