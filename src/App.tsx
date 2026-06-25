import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { UnlockAccountPage } from './pages/UnlockAccountPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/unlock-account" element={<UnlockAccountPage />} />
        <Route path="*" element={<Navigate to="/unlock-account" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
