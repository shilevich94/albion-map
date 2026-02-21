import { useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import { MapViewer } from '@/widgets/map-viewer'
import { MapToolbar } from '@/widgets/map-toolbar'
import type { AlbionMapSearchResult } from '@/entities/map'
import type { MarkPosition } from '@/entities/marked-map'
import { useCreateMarkedMapMutation } from '@/entities/marked-map'

export function MapPage() {
  const location = useLocation()
  const stateMap = location.state?.selectedMap as AlbionMapSearchResult | undefined
  const [selectedMap, setSelectedMap] = useState<AlbionMapSearchResult | null>(stateMap ?? null)
  const [marks, setMarks] = useState<MarkPosition[]>([])

  useEffect(() => {
    if (stateMap) setSelectedMap(stateMap)
  }, [stateMap])

  useEffect(() => {
    setMarks([])
  }, [selectedMap?.index])

  const [createMarkedMap, { isLoading: isSaving }] = useCreateMarkedMapMutation()

  const handleMarksChange = useCallback((newMarks: MarkPosition[]) => {
    setMarks(newMarks)
  }, [])

  const handleSave = async () => {
    if (!selectedMap) return
    await createMarkedMap({
      mapId: selectedMap.index,
      mapName: selectedMap.name,
      imageUrl: selectedMap.imageUrl ?? '',
      marks,
    })
    setMarks([])
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      <MapToolbar selectedMap={selectedMap} onMapSelect={setSelectedMap} />
      <MapViewer
        selectedMap={selectedMap}
        marks={marks}
        onMarksChange={handleMarksChange}
      />
      {selectedMap && (
        <Box>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={marks.length === 0 || isSaving}
          >
            {isSaving ? 'Saving…' : 'Save marked map'}
          </Button>
        </Box>
      )}
    </Box>
  )
}
