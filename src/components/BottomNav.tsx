import { NavLink } from 'react-router-dom'
import { Receipt, Trophy, ScrollText, ShieldCheck, type LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '@/lib/utils'

function NavItem({ to, end, icon: Icon, label }: { to: string; end?: boolean; icon: LucideIcon; label: string }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium"
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'flex items-center justify-center rounded-full px-4 py-1 transition-all duration-300',
              isActive
                ? 'scale-110 bg-gradient-to-r from-violet-600 via-red-600 to-lime-400 text-white shadow-md'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="size-5" />
          </span>
          <span
            className={cn(
              'transition-colors duration-300',
              isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const { session, profile } = useAuth()

  if (!session) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl rounded-t-xl border bg-card/70 backdrop-blur-md">
      <div className="flex items-stretch">
        <NavItem to="/" end icon={Receipt} label="Minhas Apostas" />
        <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
        <NavItem to="/regras" icon={ScrollText} label="Regras" />
        {profile?.is_admin && <NavItem to="/admin" icon={ShieldCheck} label="Admin" />}
      </div>
    </nav>
  )
}
