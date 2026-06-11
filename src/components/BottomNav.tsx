import { NavLink } from 'react-router-dom'
import { Receipt, Trophy, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '@/lib/utils'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
  )

export function BottomNav() {
  const { session, profile } = useAuth()

  if (!session) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 backdrop-blur supports-backdrop-blur:bg-card/80">
      <div className="mx-auto flex max-w-2xl items-stretch">
        <NavLink to="/" end className={linkClass}>
          <Receipt className="size-5" />
          Minhas Apostas
        </NavLink>
        <NavLink to="/leaderboard" className={linkClass}>
          <Trophy className="size-5" />
          Leaderboard
        </NavLink>
        {profile?.is_admin && (
          <NavLink to="/admin" className={linkClass}>
            <ShieldCheck className="size-5" />
            Admin
          </NavLink>
        )}
      </div>
    </nav>
  )
}
