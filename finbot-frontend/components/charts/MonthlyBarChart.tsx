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
    return <p className="text-sm text-gray-400 text-center py-6">No data</p>
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barCategoryGap="40%" barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: 'system-ui', fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'system-ui', fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #F3F4F6',
              borderRadius: 8,
              fontFamily: 'system-ui',
              fontSize: 12,
              color: '#111827',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
            formatter={(v, name) => [`฿${Number(v).toLocaleString('en-US')}`, String(name)]}
          />
          <Bar dataKey="income" fill="#22C55E" radius={[3, 3, 0, 0]} name="Income" />
          <Bar dataKey="expense" fill="#EF4444" radius={[3, 3, 0, 0]} name="Expense" />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-1 justify-end">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500" />Income
        </span>
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500" />Expense
        </span>
      </div>
    </div>
  )
}
