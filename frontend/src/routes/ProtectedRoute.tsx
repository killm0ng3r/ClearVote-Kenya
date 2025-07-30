// frontend/src/routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuth = localStorage.getItem('auth') === 'true'

  if (!isAuth) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}