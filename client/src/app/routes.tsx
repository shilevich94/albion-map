import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { MapPage } from '@/pages/map'
import { MarkedMapsPage } from '@/pages/marked-maps'
import { AllMarksMapPage } from '@/pages/all-marks-map'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <MapPage /> },
      { path: 'marked', element: <MarkedMapsPage /> },
      { path: 'all-marks', element: <AllMarksMapPage /> },
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}
