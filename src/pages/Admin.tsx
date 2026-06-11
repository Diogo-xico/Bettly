import { useEffect, useState } from 'react'
import { ExternalLink, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { betProfit, type Bet, type BetStatus } from '../lib/types'
import { StatusBadge } from '../components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BetWithUser extends Bet {
  profiles: { name: string } | null
}

export function Admin() {
  const [bets, setBets] = useState<BetWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showResolved, setShowResolved] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('bets')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
    setBets((data as BetWithUser[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function resolve(bet: Bet, status: BetStatus) {
    await supabase
      .from('bets')
      .update({ status, resolved_at: new Date().toISOString() })
      .eq('id', bet.id)
    await load()
  }

  const visibleBets = showResolved ? bets : bets.filter((b) => b.status === 'pending')

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Admin — Resolver Apostas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
            />
            Mostrar apostas já resolvidas
          </label>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar...</p>
      ) : visibleBets.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem apostas pendentes.</p>
      ) : (
        visibleBets.map((bet) => (
          <Card key={bet.id}>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{bet.profiles?.name ?? '—'}</p>
                  <p className="text-sm text-muted-foreground">{bet.description}</p>
                </div>
                <StatusBadge status={bet.status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span>
                  Odd: <span className="font-medium">{bet.odd.toFixed(2)}</span>
                </span>
                <span>
                  Valor: <span className="font-medium">{bet.stake.toFixed(2)} €</span>
                </span>
                <span>
                  Lucro:{' '}
                  <span
                    className={cn(
                      'font-semibold',
                      betProfit(bet) >= 0 ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {bet.status === 'pending' ? '-' : `${betProfit(bet).toFixed(2)} €`}
                  </span>
                </span>
                {bet.proof_url && (
                  <a
                    href={bet.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Ver print <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => resolve(bet, 'won')}
                  disabled={bet.status === 'won'}
                >
                  Ganha
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => resolve(bet, 'lost')}
                  disabled={bet.status === 'lost'}
                >
                  Perdida
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => resolve(bet, 'void')}
                  disabled={bet.status === 'void'}
                >
                  Anular
                </Button>
                {bet.status !== 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => resolve(bet, 'pending')}>
                    Repor pendente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
