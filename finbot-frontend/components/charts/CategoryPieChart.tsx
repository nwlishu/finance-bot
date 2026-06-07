'use client'
import type { CategorySummary } from '@/types/finance'

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
  data: CategorySummary[]
}

export function CategoryBreakdown({ data }: Props) {
  const total = data.reduce((s, d) => s + d.total, 0)

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="font-mono text-xs text-ink-muted">// no data</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-cream-border">
      {data.map((d, i) => {
        const pct = total > 0 ? (d.total / total) * 100 : 0
        const opacity = Math.max(0.25, 1 - i * 0.15)
        return (
          <div key={d.category} className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] tracking-wider text-ink-muted bg-cream-dark px-1.5 py-0.5 border border-cream-border">
                {CAT_CODE[d.category] ?? d.category.toUpperCase()}
              </span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-ink-muted tabular-nums">
                  {pct.toFixed(0)}%
                </span>
                <span className="font-mono text-xs font-bold text-vermilion tabular-nums w-16 text-right">
                  {d.total.toLocaleString('en-US')}
                </span>
              </div>
            </div>
            <div className="h-[3px] bg-cream-dark w-full overflow-hidden">
              <div
                className="h-full bg-vermilion"
                style={{ width: `${pct}%`, opacity }}
              />
            </div>
          </div>
        )
      })}
      <div className="px-4 py-2.5 flex justify-between bg-cream-dark">
        <span className="font-mono text-[9px] tracking-[0.3em] text-ink-muted uppercase">Total</span>
        <span className="font-mono text-xs font-bold text-ink tabular-nums">
          {total.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  )
}

export function CategoryPieChart({ data }: Props) {
  return <CategoryBreakdown data={data} />
}
