'use client'
import { useEffect, useState } from 'react'
import { initLiff } from '@/lib/liff'
import { useWallets } from '@/hooks/useWallets'
import { useSummary } from '@/hooks/useSummary'
import { useTransactions } from '@/hooks/useTransactions'
import { WalletSelector } from '@/components/dashboard/WalletSelector'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart'
import { CategoryBreakdown } from '@/components/charts/CategoryPieChart'
import { BottomNav } from '@/components/layout/BottomNav'
import { MOCK_WALLETS, MOCK_MONTHLY, MOCK_BY_CATEGORY, MOCK_TRANSACTIONS } from '@/lib/mockData'
import type { Transaction } from '@/types/finance'

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function MiniList({ items, type }: { items: Transaction[]; type: 'income' | 'expense' }) {
  if (items.length === 0) return null
  return (
    <div className="mt-2.5 space-y-1.5">
      {items.map((t) => (
        <div key={t.id} className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500 truncate mr-1 max-w-[80px]">
            {t.note || t.category}
          </span>
          <span className={`text-[11px] font-semibold font-mono tabular-nums flex-shrink-0 ${
            type === 'income' ? 'text-gray-600' : 'text-red-500'
          }`}>
            {fmt(t.amount)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initLiff()
      .then(() => setReady(true))
      .catch(() => setReady(true))
  }, [])

  const { wallets: realWallets, activeWallet: realActive, switchWallet } = useWallets(ready)

  const wallets      = realWallets.length > 0 ? realWallets : MOCK_WALLETS
  const activeWallet = realActive ?? MOCK_WALLETS[0]

  const { monthly: realMonthly, byCategory: realByCategory } = useSummary(realActive?.id)
  const { transactions: realTransactions, remove } = useTransactions(realActive?.id, { limit: '20' })

  const monthly      = realMonthly ?? MOCK_MONTHLY
  const byCategory   = realByCategory.length > 0 ? realByCategory : MOCK_BY_CATEGORY
  const transactions = realTransactions.length > 0 ? realTransactions : MOCK_TRANSACTIONS

  const income  = monthly.total_income
  const expense = monthly.total_expense
  const net     = monthly.net

  const incomeItems  = transactions.filter(t => t.type === 'income').slice(0, 3)
  const expenseItems = transactions.filter(t => t.type === 'expense').slice(0, 3)
  const spentPct     = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0

  const now        = new Date()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long' })
  const yearLabel  = now.getFullYear()

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E8EFF9]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#E8EFF9] max-w-lg mx-auto pb-28">

      {/* ── Header ── */}
      <div className="pt-12 pb-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">My Finances</h1>
        <div className="h-px bg-gray-300 mt-3" />
      </div>

      {/* ── Wallet Selector ── */}
      <WalletSelector wallets={wallets} active={activeWallet} onChange={switchWallet} />

      {/* ── 2×2 Summary Cards ── */}
      <div className="px-4 grid grid-cols-2 gap-3">

        {/* Income */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-sm text-gray-900">Income</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{monthLabel} {yearLabel}</p>
          <p className="text-2xl font-bold text-emerald-500 mt-2 font-mono tabular-nums leading-none">
            {fmt(income)}
          </p>
          <MiniList items={incomeItems} type="income" />
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-sm text-gray-900">Expenses</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{monthLabel} {yearLabel}</p>
          <p className="text-2xl font-bold text-red-500 mt-2 font-mono tabular-nums leading-none">
            {fmt(expense)}
          </p>
          <MiniList items={expenseItems} type="expense" />
        </div>

        {/* Balance */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-sm text-gray-900">Balance</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{monthLabel} {yearLabel}</p>
          <p className={`text-2xl font-bold mt-2 font-mono tabular-nums leading-none ${
            net >= 0 ? 'text-gray-900' : 'text-red-500'
          }`}>
            {fmt(net)}
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-gray-500">Spent</span>
              <span className="text-blue-500 font-medium">{spentPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${spentPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* This Month Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-sm text-gray-900">This Month</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Summary</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Income</span>
              <span className="font-semibold font-mono text-gray-700 tabular-nums">{fmt(income)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Expense</span>
              <span className="font-semibold font-mono text-red-500 tabular-nums">{fmt(expense)}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between text-[11px]">
              <span className="font-semibold text-gray-700">Balance</span>
              <span className={`font-bold font-mono tabular-nums ${net >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                {fmt(net)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Spending Budget ── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
        <p className="font-bold text-sm text-gray-900 mb-4">Spending Budget</p>
        <CategoryBreakdown data={byCategory} />
      </div>

      {/* ── Daily Flow ── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-sm text-gray-900">Daily Flow</p>
          <span className="text-xs text-gray-400">{monthLabel} {yearLabel}</span>
        </div>
        <MonthlyBarChart data={monthly?.daily_totals} />
      </div>

      {/* ── Recent Transactions ── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="font-bold text-sm text-gray-900">Recent Transactions</p>
          <span className="text-xs text-gray-400">{transactions.length} items</span>
        </div>
        <RecentTransactions transactions={transactions} onDelete={remove} />
      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNav active="dashboard" />

    </main>
  )
}
