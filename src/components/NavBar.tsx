import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'

export function NavBar() {
  const { session, profile, signOut } = useAuth()

  if (!session) return null

  return (
    <header className="sticky top-0 z-40 mx-auto max-w-2xl rounded-b-xl border bg-card/70 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="font-display font-semibold tracking-wide">Mundial 2026 — Apostas</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{profile?.name}</span>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
