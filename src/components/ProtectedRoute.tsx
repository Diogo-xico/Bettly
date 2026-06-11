import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <div className="p-12 text-center text-muted-foreground">A carregar...</div>
  if (!session) return <Navigate to="/login" replace />
  if (adminOnly && !profile?.is_admin) return <Navigate to="/" replace />

  return <>{children}</>
}
