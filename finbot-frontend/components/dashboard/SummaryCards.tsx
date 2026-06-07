'use client'
import type { MonthlySummary } from '@/types/finance'

interface Props {
  monthly: MonthlySummary | null
  currency: string
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function SummaryCards({ monthly, currency }: Props) {
  const income = monthly?.total_income ?? 0
  const expense = monthly?.total_expense ?? 0
  const net = monthly?.net ?? 0

  const cards = [
    { label: 'INCOME', value: income, color: '#1A5C3A', prefix: '+' },
    { label: 'EXPENSE', value: expense, color: '#CC3300', prefix: '-' },
    { label: 'NET', value: Math.abs(net), color: net >= 0 ? '#1A5C3A' : '#CC3300', prefix: net >= 0 ? '+' : '-' },
  ]

  return (
    <div className="border border-cream-border divide-x divide-cream-border grid grid-cols-3">
      {cards.map(({ label, value, color, prefix }) => (
        <div key={label} className="p-4">
          <p className="font-mono text-[8px] tracking-[0.35em] text-ink-muted uppercase mb-3">{label}</p>
          <p className="font-mono text-lg font-bold leading-none tabular-nums" style={{ color }}>
            {prefix}{fmt(value)}
          </p>
          <p className="font-mono text-[9px] text-ink-muted mt-1.5">{currency}</p>
        </div>
      ))}
    </div>
  )
}
