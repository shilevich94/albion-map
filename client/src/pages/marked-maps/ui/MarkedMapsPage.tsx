import { useState, useEffect } from 'react'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
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
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useListMarkedMapsQuery, useDeleteMarkedMapMutation, useUpdateMarkedMapMutation } from '@/entities/marked-map'
import type { MarkedMap, MarkPosition } from '@/entities/marked-map'
import { MapViewer } from '@/widgets/map-viewer'

const PLACEHOLDER_SVG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140"%3E%3Crect fill="%23f0f4f8" width="200" height="140"/%3E%3Ctext fill="%237890a0" font-size="12" x="100" y="70" text-anchor="middle"%3ENo image%3C/text%3E%3C/svg%3E'

export function MarkedMapsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const { data: list = [], isFetching } = useListMarkedMapsQuery(debouncedSearch)
  const [deleteMarkedMap] = useDeleteMarkedMapMutation()
  const [updateMarkedMap] = useUpdateMarkedMapMutation()

  const [popupItem, setPopupItem] = useState<MarkedMap | null>(null)
  const [draftMarks, setDraftMarks] = useState<MarkPosition[]>([])

  useEffect(() => {
    if (popupItem) setDraftMarks(popupItem.marks)
  }, [popupItem])

  const handleCardClick = (row: MarkedMap) => {
    setPopupItem(row)
  }

  const handleClosePopup = () => {
    setPopupItem(null)
  }

  const handleSaveMarks = async () => {
    if (!popupItem) return
    await updateMarkedMap({
      id: popupItem._id,
      marks: draftMarks,
    })
    handleClosePopup()
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteMarkedMap(id)
    if (popupItem?._id === id) handleClosePopup()
  }

  const popupMap = popupItem
    ? {
        index: popupItem.mapId,
        name: popupItem.mapName,
        imageUrl: popupItem.imageUrl,
        mapPageUrl: `https://albiononline2d.com/en/map/${popupItem.mapId}`,
      }
    : null

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Marked maps</Typography>
      <TextField
        label="Search by map name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ maxWidth: 320 }}
      />
      <Grid container spacing={2}>
        {isFetching && list.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">Loading…</Typography>
          </Grid>
        ) : list.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">No marked maps. Add marks on the Mark map tab.</Typography>
          </Grid>
        ) : (
          list.map((row) => (
            <Grid item xs={12} sm={6} md={4} key={row._id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => handleCardClick(row)} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <CardMedia
                    component="img"
                    height={140}
                    image={row.imageUrl || PLACEHOLDER_SVG}
                    alt={row.mapName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium" noWrap title={row.mapName}>
                      {row.mapName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.marks.length} mark{row.marks.length !== 1 ? 's' : ''}
                      {row.createdAt && ` · ${new Date(row.createdAt).toLocaleDateString()}`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Delete"
                    onClick={(e) => handleDelete(e, row._id)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={!!popupItem} onClose={handleClosePopup} maxWidth="md" fullWidth>
        <DialogTitle>{popupItem?.mapName ?? ''}</DialogTitle>
        <DialogContent>
          {popupMap && (
            <MapViewer
              selectedMap={popupMap}
              marks={draftMarks}
              onMarksChange={setDraftMarks}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup}>Close</Button>
          <Button variant="contained" onClick={handleSaveMarks}>
            Save marks
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
