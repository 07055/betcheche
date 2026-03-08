import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import AuthPage from './pages/AuthPage.jsx'
import GamePage from './pages/GamePage.jsx'
import { useGameStore } from './store/useGameStore.js'

function ProtectedRoute({ children }) {
  const isAuthenticated = useGameStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/game" element={
        <ProtectedRoute>
          <GamePage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
