'use client'
import type { CategorySummary } from '@/types/finance'

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

const CAT_COLOR: Record<string, string> = {
  food: '#F97316',
  transport: '#3B82F6',
  shopping: '#A855F7',
  entertainment: '#EC4899',
  health: '#10B981',
  salary: '#16A34A',
  freelance: '#059669',
  utilities: '#EAB308',
  rent: '#6366F1',
  other: '#9CA3AF',
}

interface Props {
  data: CategorySummary[]
}

export function CategoryBreakdown({ data }: Props) {
  const total = data.reduce((s, d) => s + d.total, 0)

  if (data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No data</p>
  }

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = total > 0 ? (d.total / total) * 100 : 0
        const color = CAT_COLOR[d.category] ?? '#9CA3AF'
        return (
          <div key={d.category} className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{CAT_NAME[d.category] ?? d.category}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-400 tabular-nums w-8 text-right">{pct.toFixed(0)}%</span>
            <span className="text-sm font-semibold font-mono tabular-nums text-red-500 w-20 text-right">
              ฿{d.total.toLocaleString('en-US')}
            </span>
          </div>
        )
      })}

      <div className="flex justify-between pt-3 border-t border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Total</span>
        <span className="text-sm font-bold font-mono tabular-nums text-gray-900">
          ฿{total.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  )
}

export function CategoryPieChart({ data }: Props) {
  return <CategoryBreakdown data={data} />
}
