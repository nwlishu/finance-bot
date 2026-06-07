'use client'
import type { Transaction } from '@/types/finance'

const CAT_CODE: Record<string, string> = {
  food: 'FOOD',
  transport: 'TRNSP',
  shopping: 'SHOP',
  entertainment: 'ENT',
  health: 'HLTH',
  salary: 'SAL',
  freelance: 'FREE',
  utilities: 'UTIL',
  rent: 'RENT',
  other: 'MISC',
}

interface Props {
  transactions: Transaction[]
  onDelete?: (id: number) => void
}

export function RecentTransactions({ transactions, onDelete }: Props) {
  return (
    <div>
      {/* Table header */}
      <div className="grid grid-cols-[52px_1fr_auto] gap-3 px-4 py-2 bg-cream-dark border-b border-cream-border">
        <span className="font-mono text-[8px] tracking-[0.3em] text-ink-muted uppercase">Cat</span>
        <span className="font-mono text-[8px] tracking-[0.3em] text-ink-muted uppercase">Description</span>
        <span className="font-mono text-[8px] tracking-[0.3em] text-ink-muted uppercase text-right">Amount</span>
      </div>

      {transactions.length === 0 && (
        <p className="font-mono text-[11px] text-ink-muted text-center py-10">
          // no entries yet
        </p>
      )}

      <ul className="divide-y divide-cream-border">
        {transactions.map((t) => (
          <li key={t.id} className="grid grid-cols-[52px_1fr_auto] gap-3 items-center px-4 py-3 group hover:bg-cream-dark transition-colors">
            <span className="font-mono text-[8px] tracking-wider text-ink-muted bg-cream-dark px-1.5 py-0.5 text-center border border-cream-border">
              {CAT_CODE[t.category] ?? 'MISC'}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs text-ink truncate">{t.note || t.category}</p>
              <p className="font-mono text-[9px] text-ink-muted mt-0.5">{t.transaction_date?.slice(0, 10)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm font-bold tabular-nums ${
                t.type === 'income' ? 'text-ledger-green' : 'text-vermilion'
              }`}>
                {t.type === 'income' ? '+' : '−'}{t.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
              {onDelete && (
                <button
                  onClick={() => onDelete(t.id)}
                  className="font-mono text-cream-border hover:text-vermilion text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
