import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material'
import { MapViewer } from '@/widgets/map-viewer'
import type { MarkPosition } from '@/entities/marked-map'
import { useListMarkedMapsQuery, useGetMarkedMapsForMapQuery } from '@/entities/marked-map'
import type { MarkedMap } from '@/entities/marked-map'

const PLACEHOLDER_SVG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140"%3E%3Crect fill="%23f0f4f8" width="200" height="140"/%3E%3Ctext fill="%237890a0" font-size="12" x="100" y="70" text-anchor="middle"%3ENo image%3C/text%3E%3C/svg%3E'

interface MapWithMarks {
  mapId: string
  mapName: string
  imageUrl: string
  totalMarks: number
  savedCount: number
}

/** Distance between two marks in percentage space */
function markDistance(a: MarkPosition, b: MarkPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Merge marks that intersect (are within thresholdPercent of each other); keep one per cluster */
function mergeIntersectingMarks(
  marks: MarkPosition[],
  thresholdPercent = 2.5
): MarkPosition[] {
  const result: MarkPosition[] = []
  for (const mark of marks) {
    const intersects = result.some((existing) => markDistance(existing, mark) <= thresholdPercent)
    if (!intersects) result.push({ ...mark })
  }
  return result
}

function groupByMap(list: MarkedMap[]): MapWithMarks[] {
  const byMap = new Map<string, MapWithMarks>()
  for (const doc of list) {
    const existing = byMap.get(doc.mapId)
    if (!existing) {
      byMap.set(doc.mapId, {
        mapId: doc.mapId,
        mapName: doc.mapName,
        imageUrl: doc.imageUrl,
        totalMarks: doc.marks.length,
        savedCount: 1,
      })
    } else {
      existing.totalMarks += doc.marks.length
      existing.savedCount += 1
    }
  }
  return Array.from(byMap.values())
}

export function AllMarksMapPage() {
  const { data: list = [], isFetching } = useListMarkedMapsQuery({ todayOnly: false })
  const [popupMap, setPopupMap] = useState<MapWithMarks | null>(null)

  const mapsWithMarks = useMemo(() => groupByMap(list), [list])

  const { data: markedMapsForPopup = [] } = useGetMarkedMapsForMapQuery(popupMap?.mapId ?? '', {
    skip: !popupMap,
  })
  const allMarksInPopup: MarkPosition[] = useMemo(() => {
    const flat = markedMapsForPopup.flatMap((doc) => doc.marks)
    return mergeIntersectingMarks(flat)
  }, [markedMapsForPopup])

  const popupMapForViewer = popupMap
    ? {
        index: popupMap.mapId,
        name: popupMap.mapName,
        imageUrl: popupMap.imageUrl,
        mapPageUrl: `https://albiononline2d.com/en/map/${popupMap.mapId}`,
      }
    : null

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Map with all marks</Typography>
      <Typography variant="body2" color="text.secondary">
        Maps that have saved marks. Click a card to see the map with all related marks (read-only).
      </Typography>
      <Grid container spacing={2}>
        {isFetching && list.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">Loading…</Typography>
          </Grid>
        ) : mapsWithMarks.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">No maps with marks yet. Add marks on the Mark map tab.</Typography>
          </Grid>
        ) : (
          mapsWithMarks.map((map) => (
            <Grid item xs={12} sm={6} md={4} key={map.mapId}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea
                  onClick={() => setPopupMap(map)}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardMedia
                    component="img"
                    height={140}
                    image={map.imageUrl || PLACEHOLDER_SVG}
                    alt={map.mapName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium" noWrap title={map.mapName}>
                      {map.mapName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {map.totalMarks} mark{map.totalMarks !== 1 ? 's' : ''}
                      {map.savedCount > 1 && ` from ${map.savedCount} saved maps`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={!!popupMap} onClose={() => setPopupMap(null)} maxWidth="md" fullWidth>
        <DialogTitle>{popupMap?.mapName ?? ''}</DialogTitle>
        <DialogContent>
          {popupMapForViewer && (
            <MapViewer
              selectedMap={popupMapForViewer}
              marks={allMarksInPopup}
              readOnly
              showMarkLabels={false}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPopupMap(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
