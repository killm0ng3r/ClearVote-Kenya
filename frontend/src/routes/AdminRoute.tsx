// frontend/src/components/ProtectedAdminRoute.tsx
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const isAuth = localStorage.getItem('auth') === 'true'
  const isAdmin = localStorage.getItem('role') === 'ADMIN'

  if (!isAuth || !isAdmin) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}