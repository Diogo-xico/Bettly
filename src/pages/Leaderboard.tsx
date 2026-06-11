import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { betProfit, type Bet, type Profile } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface LeaderboardRow {
  profile: Profile
  profit: number
  balance: number
  pendingCount: number
}

export function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: profiles }, { data: bets }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('bets').select('*'),
      ])

      const profileList = profiles ?? []
      const betList: Bet[] = bets ?? []

      const computed = profileList.map((profile) => {
        const userBets = betList.filter((b) => b.user_id === profile.id)
        const profit = userBets.reduce((sum, b) => sum + betProfit(b), 0)
        const pendingCount = userBets.filter((b) => b.status === 'pending').length
        return {
          profile,
          profit,
          balance: profile.starting_balance + profit,
          pendingCount,
        }
      })

      computed.sort((a, b) => b.balance - a.balance)
      setRows(computed)
      setLoading(false)
    }

    load()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">A carregar...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Lucro</TableHead>
                <TableHead className="hidden sm:table-cell">Pendentes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.profile.id}>
                  <TableCell className="font-semibold">{i + 1}</TableCell>
                  <TableCell>{row.profile.name}</TableCell>
                  <TableCell className="font-semibold">{row.balance.toFixed(2)} €</TableCell>
                  <TableCell
                    className={cn(
                      'font-semibold',
                      row.profit >= 0 ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {row.profit >= 0 ? '+' : ''}
                    {row.profit.toFixed(2)} €
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{row.pendingCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
