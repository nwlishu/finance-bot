'use client'
import type { Transaction } from '@/types/finance'

const CAT_NAME: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  health: 'Health',
  salary: 'Salary',
  freelance: 'Freelance',
  utilities: 'Utilities',
  rent: 'Rent',
  other: 'Other',
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

interface Props {
  transactions: Transaction[]
  onDelete?: (id: number) => void
}

export function RecentTransactions({ transactions, onDelete }: Props) {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No transactions yet</p>
  }

  return (
    <ul>
      {transactions.map((t) => (
        <li
          key={t.id}
          className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 group"
        >
          <div className="flex-1 min-w-0 mr-3">
            <p className="text-sm text-gray-800 truncate">
              {t.note || CAT_NAME[t.category] || t.category}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.transaction_date)}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-sm font-semibold font-mono tabular-nums ${
              t.type === 'income' ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {t.type === 'income' ? '+' : '−'}฿{t.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            {onDelete && (
              <button
                onClick={() => onDelete(t.id)}
                className="w-5 h-5 rounded-full bg-red-50 text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-100"
                aria-label="Delete"
              >
                ×
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
