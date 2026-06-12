export type BetStatus = 'pending' | 'won' | 'lost' | 'void'

export interface Profile {
  id: string
  name: string
  is_admin: boolean
  starting_balance: number
  predicted_champion: string | null
  predicted_top_scorer: string | null
  actual_champion: string | null
  actual_top_scorer: string | null
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

export function normalizeGuess(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
}

export function guessIsCorrect(guess: string | null, actual: string | null): boolean {
  const normalizedActual = normalizeGuess(actual)
  if (!normalizedActual) return false
  return normalizeGuess(guess) === normalizedActual
}
