import { Box, Tab, Tabs } from '@mui/material'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

const TAB_PATHS = ['/', '/marked', '/all-marks'] as const

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const value = TAB_PATHS.indexOf(location.pathname as (typeof TAB_PATHS)[number])
  const tabValue = value === -1 ? 0 : value

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Tabs
        value={tabValue}
        onChange={(_, v) => navigate(TAB_PATHS[v])}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
      >
        <Tab label="Mark map" value={0} />
        <Tab label="Marked maps" value={1} />
        <Tab label="Map with all marks" value={2} />
      </Tabs>
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
