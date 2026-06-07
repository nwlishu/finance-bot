'use client'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DailyTotal } from '@/types/finance'

interface Props {
  data: DailyTotal[] | null | undefined
}

export function MonthlyBarChart({ data }: Props) {
  const chartData = (data ?? []).map((d) => ({
    date: d.date.slice(8),
    income: d.income,
    expense: d.expense,
  }))

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="font-mono text-xs text-ink-muted">// no data</p>
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barCategoryGap="40%" barGap={2}>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="rgba(180,155,120,0.2)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fontFamily: 'var(--font-geist-mono)', fill: '#9C8E7E' }}
            axisLine={{ stroke: '#D4C9B4', strokeWidth: 0.5 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fontFamily: 'var(--font-geist-mono)', fill: '#9C8E7E' }}
            axisLine={false}
            tickLine={false}
            width={38}
            tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#F5F0E8',
              border: '0.5px solid #D4C9B4',
              borderRadius: 0,
              fontFamily: 'var(--font-geist-mono)',
              fontSize: 11,
              color: '#1A1410',
            }}
            formatter={(v, name) => [Number(v).toLocaleString('en-US'), String(name)]}
          />
          <Bar dataKey="income" fill="#1A5C3A" radius={0} name="income" />
          <Bar dataKey="expense" fill="#CC3300" radius={0} name="expense" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 justify-end">
        <span className="font-mono text-[9px] text-ink-muted flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 bg-ledger-green" />income
        </span>
        <span className="font-mono text-[9px] text-ink-muted flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 bg-vermilion" />expense
        </span>
      </div>
    </div>
  )
}
