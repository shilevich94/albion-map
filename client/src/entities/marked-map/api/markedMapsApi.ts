import { baseApi } from '@/shared/api/baseApi'
import type { MarkedMap } from '../model/types'

export const markedMapsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listMarkedMaps: build.query<
      MarkedMap[],
      { q?: string; todayOnly?: boolean }
    >({
      query: ({ q, todayOnly = true }) => {
        const params: Record<string, string> = {
          todayOnly: todayOnly ? 'true' : 'false',
        }
        if (q) params.q = q
        return { url: '/marked-maps', params }
      },
      providesTags: (result) =>
        result ? [...result.map((m) => ({ type: 'MarkedMap' as const, id: m._id })), 'MarkedMap'] : ['MarkedMap'],
    }),
    getMarkedMapsForMap: build.query<MarkedMap[], string>({
      query: (mapId) => ({ url: `/marked-maps/for-map/${encodeURIComponent(mapId)}` }),
      providesTags: (_result, _err, mapId) => [{ type: 'MarkedMap', id: `for-map-${mapId}` }],
    }),
    createMarkedMap: build.mutation<
      MarkedMap,
      { mapId: string; mapName: string; imageUrl: string; marks: { x: number; y: number; name?: string }[] }
    >({
      query: (body) => ({
        url: '/marked-maps',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => ['MarkedMap', { type: 'MarkedMap', id: `for-map-${arg.mapId}` }],
    }),
    updateMarkedMap: build.mutation<
      MarkedMap,
      { id: string; mapId?: string; mapName?: string; imageUrl?: string; marks: { x: number; y: number; name?: string }[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/marked-maps/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, arg) => [{ type: 'MarkedMap', id: arg.id }, 'MarkedMap'],
    }),
    deleteMarkedMap: build.mutation<void, string>({
      query: (id) => ({
        url: `/marked-maps/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, id) => [{ type: 'MarkedMap', id }, 'MarkedMap'],
    }),
  }),
})

export const {
  useListMarkedMapsQuery,
  useGetMarkedMapsForMapQuery,
  useCreateMarkedMapMutation,
  useUpdateMarkedMapMutation,
  useDeleteMarkedMapMutation,
} = markedMapsApi
