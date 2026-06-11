import { Badge, type BadgeProps } from '@/components/ui/badge'
import type { BetStatus } from '../lib/types'

const STATUS_LABELS: Record<BetStatus, string> = {
  pending: 'Pendente',
  won: 'Ganha',
  lost: 'Perdida',
  void: 'Anulada',
}

const STATUS_VARIANTS: Record<BetStatus, BadgeProps['variant']> = {
  pending: 'warning',
  won: 'success',
  lost: 'destructive',
  void: 'secondary',
}

export function StatusBadge({ status }: { status: BetStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
}
