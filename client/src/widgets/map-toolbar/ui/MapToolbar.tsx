import { Box } from '@mui/material'
import { MapSearchAutocomplete } from '@/features/map-search'
import type { AlbionMapSearchResult } from '@/entities/map'

interface MapToolbarProps {
  selectedMap: AlbionMapSearchResult | null
  onMapSelect: (map: AlbionMapSearchResult | null) => void
}

export function MapToolbar({ selectedMap, onMapSelect }: MapToolbarProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, p: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      <MapSearchAutocomplete selectedMap={selectedMap} onSelect={onMapSelect} />
    </Box>
  )
}
