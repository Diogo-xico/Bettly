export type BetStatus = 'pending' | 'won' | 'lost' | 'void'

export interface Profile {
  id: string
  name: string
  is_admin: boolean
  starting_balance: number
}

export interface Bet {
  id: string
  user_id: string
  description: string
  odd: number
  stake: number
  status: BetStatus
  proof_url: string | null
  created_at: string
  resolved_at: string | null
}

export function betProfit(bet: Pick<Bet, 'status' | 'stake' | 'odd'>): number {
  if (bet.status === 'won') return bet.stake * (bet.odd - 1)
  if (bet.status === 'lost') return -bet.stake
  return 0
}
