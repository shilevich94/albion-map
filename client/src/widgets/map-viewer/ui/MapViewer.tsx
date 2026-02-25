import { useCallback, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import type { AlbionMapSearchResult } from '@/entities/map'
import type { MarkPosition } from '@/entities/marked-map'

const PLACEHOLDER_SVG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"%3E%3Crect fill="%23f0f4f8" width="400" height="280"/%3E%3Ctext fill="%237890a0" font-family="sans-serif" font-size="14" x="200" y="140" text-anchor="middle"%3EMap image unavailable%3C/text%3E%3C/svg%3E'

const MARK_SIZE_PX = 18
const HIT_RADIUS_PX = MARK_SIZE_PX / 2 + 4

interface MapViewerProps {
  selectedMap: AlbionMapSearchResult | null
  marks: MarkPosition[]
  onMarksChange?: (marks: MarkPosition[]) => void
  /** When true, marks are display-only (no add/remove) */
  readOnly?: boolean
  /** When true and mark has name, show label under the dot */
  showMarkLabels?: boolean
  /** Optional click handler for a mark; when provided, clicking a mark calls this instead of removing it */
  onMarkClick?: (mark: MarkPosition, index: number, event: React.MouseEvent) => void
}

export function MapViewer({
  selectedMap,
  marks,
  onMarksChange,
  readOnly = false,
  showMarkLabels = true,
  onMarkClick,
}: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null)

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageSize({ w: img.offsetWidth, h: img.offsetHeight })
  }, [])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly || !onMarksChange || !selectedMap?.imageUrl || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const w = rect.width
      const h = rect.height
      const xPercent = Math.max(0, Math.min(100, (x / w) * 100))
      const yPercent = Math.max(0, Math.min(100, (y / h) * 100))

      for (let i = 0; i < marks.length; i++) {
        const m = marks[i]
        const mx = (m.x / 100) * w
        const my = (m.y / 100) * h
        const dist = Math.hypot(x - mx, y - my)
        if (dist <= HIT_RADIUS_PX) {
          onMarksChange(marks.filter((_, idx) => idx !== i))
          return
        }
      }
      onMarksChange([...marks, { x: xPercent, y: yPercent }])
    },
    [readOnly, onMarksChange, selectedMap?.imageUrl, marks]
  )

  if (!selectedMap) {
    return (
      <Box
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          gap: 1,
        }}
      >
        <Typography color="text.secondary">Search and select a map above</Typography>
      </Box>
    )
  }

  const imageUrl = selectedMap.imageUrl ?? PLACEHOLDER_SVG
  const isPlaceholder = !selectedMap.imageUrl

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">{selectedMap.name}</Typography>
      </Box>
      <Box
        ref={containerRef}
        sx={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={selectedMap.name}
          onLoad={handleImageLoad}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = PLACEHOLDER_SVG
          }}
          sx={{
            width: 600,
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            display: 'block',
          }}
        />
        {!isPlaceholder && imageSize && (
          <>
            {!readOnly && (
              <Box
                onClick={handleOverlayClick}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  cursor: 'crosshair',
                }}
              />
            )}
            {marks.map((m, i) => (
              <Box
                key={`${m.x}-${m.y}-${i}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (onMarkClick) {
                    onMarkClick(m, i, e)
                    return
                  }
                  if (readOnly || !onMarksChange) return
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (!rect) return
                  const mx = (m.x / 100) * rect.width
                  const my = (m.y / 100) * rect.height
                  const dist = Math.hypot(e.clientX - rect.left - mx, e.clientY - rect.top - my)
                  if (dist <= HIT_RADIUS_PX) {
                    onMarksChange(marks.filter((_, idx) => idx !== i))
                  }
                }}
                sx={{
                  position: 'absolute',
                  left: `calc(${m.x}% - ${MARK_SIZE_PX / 2}px)`,
                  top: `calc(${m.y}% - ${MARK_SIZE_PX / 2}px)`,
                  width: MARK_SIZE_PX,
                  height: MARK_SIZE_PX,
                  borderRadius: '50%',
                  backgroundColor: 'red',
                  border: '2px solid #fff',
                  boxSizing: 'border-box',
                  cursor: readOnly && !onMarkClick ? 'default' : 'pointer',
                  pointerEvents: 'auto',
                }}
              >
                {showMarkLabels && m.name && (
                  <Typography
                    component="span"
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      mt: 0.25,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textShadow: '0 0 2px #000, 0 0 4px #000',
                    }}
                  >
                    {m.name}
                  </Typography>
                )}
              </Box>
            ))}
          </>
        )}
      </Box>
    </Box>
  )
}
