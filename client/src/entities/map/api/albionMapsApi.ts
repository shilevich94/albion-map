import { baseApi } from '@/shared/api/baseApi'
import type { AlbionMapSearchResult } from '../model/types'

export const albionMapsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchAlbionMaps: build.query<AlbionMapSearchResult[], string>({
      query: (q) => ({
        url: '/albion-maps',
        params: q ? { q } : undefined,
      }),
    }),
    searchGameMaps: build.query<AlbionMapSearchResult[], string>({
      query: (q) => ({
        url: '/game-maps/search',
        params: { q },
      }),
    }),
  }),
})

export const { useSearchAlbionMapsQuery, useSearchGameMapsQuery } = albionMapsApi
