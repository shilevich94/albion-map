import { Autocomplete, TextField } from '@mui/material'
import { useCallback, useState } from 'react'
import { useSearchGameMapsQuery } from '@/entities/map/api/albionMapsApi'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import type { AlbionMapSearchResult } from '@/entities/map'

const DEBOUNCE_MS = 300

interface MapSearchAutocompleteProps {
  onSelect: (map: AlbionMapSearchResult | null) => void
  selectedMap: AlbionMapSearchResult | null
}

export function MapSearchAutocomplete({
  onSelect,
  selectedMap,
}: MapSearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const debouncedQuery = useDebouncedValue(inputValue.trim(), DEBOUNCE_MS)
  const { data: maps = [], isFetching } = useSearchGameMapsQuery(debouncedQuery, {
    skip: debouncedQuery.length < 1,
  })

  const handleChange = useCallback(
    (_: unknown, value: AlbionMapSearchResult | null) => {
      setInputValue(value ? value.name : '')
      onSelect(value)
    },
    [onSelect]
  )

  return (
    <Autocomplete
      sx={{ minWidth: 320 }}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      options={maps}
      loading={isFetching}
      filterOptions={(opts) => opts}
      getOptionLabel={(opt) => opt.name}
      value={selectedMap}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField {...params} label="Search maps (e.g. Razorrock Chasm)" variant="outlined" />
      )}
    />
  )
}
