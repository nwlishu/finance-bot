'use client'
import { useWallets } from '@/hooks/useWallets'
import { useSummary } from '@/hooks/useSummary'
import { useTransactions } from '@/hooks/useTransactions'
import { WalletSelector } from '@/components/dashboard/WalletSelector'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart'
import { CategoryBreakdown } from '@/components/charts/CategoryPieChart'
import { MOCK_WALLETS, MOCK_MONTHLY, MOCK_BY_CATEGORY, MOCK_TRANSACTIONS } from '@/lib/mockData'

// LIFF auth commented out for UI design — re-enable before going live
// import { useEffect, useState } from 'react'
// import { initLiff } from '@/lib/liff'

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export default function DashboardPage() {
  const { wallets: realWallets, activeWallet: realActive, switchWallet } = useWallets()

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
  const currency = activeWallet?.currency ?? 'THB'

  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const yearLabel  = now.getFullYear()

  return (
    <main className="min-h-screen grid-paper max-w-lg mx-auto">

      {/* ── Header ── */}
      <header className="px-6 pt-12 pb-6 flex items-start justify-between">
        <div>
          <p className="font-mono text-[8px] tracking-[0.4em] text-ink-muted uppercase mb-3">
            Personal Finance
          </p>
          <h1 className="font-display text-[2.6rem] font-bold text-ink leading-[0.88] tracking-tight">
            Finance<br />Ledger
          </h1>
        </div>
        <div className="text-right mt-1 shrink-0">
          <p className="font-mono text-[10px] font-bold text-vermilion tracking-widest">{monthLabel}</p>
          <p className="font-mono text-[10px] text-ink-muted tracking-widest">{yearLabel}</p>
          <div className="w-5 h-px bg-vermilion ml-auto mt-2" />
        </div>
      </header>

      {/* ── Wallet Selector ── */}
      <div className="border-y border-cream-border">
        <WalletSelector wallets={wallets} active={activeWallet} onChange={switchWallet} />
      </div>

      {/* ── Hero Balance ── */}
      <div className="px-6 pt-8 pb-7 border-b border-cream-border">
        <p className="font-mono text-[8px] tracking-[0.45em] text-ink-muted uppercase mb-5">
          Net Balance
        </p>
        <p className={`font-display text-6xl font-bold leading-none tracking-tight ${net >= 0 ? 'text-ink' : 'text-vermilion'}`}>
          {net >= 0 ? '+' : '−'}{fmt(Math.abs(net))}
        </p>
        <div className="flex items-center gap-2 mt-4">
          <span className="font-mono text-[10px] text-ink-muted">{currency}</span>
          <span className="text-cream-deep">·</span>
          <span className="font-mono text-[10px] text-ink-muted">{activeWallet?.name}</span>
        </div>
      </div>

      {/* ── Income / Expense ── */}
      <div className="grid grid-cols-2 divide-x divide-cream-border border-b border-cream-border">
        <div className="px-6 py-5">
          <p className="font-mono text-[8px] tracking-[0.4em] text-ink-muted uppercase mb-3">Income</p>
          <p className="font-mono text-2xl font-bold text-ledger-green tabular-nums">
            +{fmt(income)}
          </p>
          <p className="font-mono text-[9px] text-ink-muted mt-1.5">{currency}</p>
        </div>
        <div className="px-6 py-5">
          <p className="font-mono text-[8px] tracking-[0.4em] text-ink-muted uppercase mb-3">Expense</p>
          <p className="font-mono text-2xl font-bold text-vermilion tabular-nums">
            −{fmt(expense)}
          </p>
          <p className="font-mono text-[9px] text-ink-muted mt-1.5">{currency}</p>
        </div>
      </div>

      {/* ── Daily Flow ── */}
      <SectionHeader label="Daily Flow" meta={`${monthLabel} ${yearLabel}`} />
      <div className="px-4 py-4 border-b border-cream-border">
        <MonthlyBarChart data={monthly?.daily_totals} />
      </div>

      {/* ── Category Breakdown ── */}
      <SectionHeader label="By Category" meta={`${byCategory.length} cats`} />
      <div className="border-b border-cream-border">
        <CategoryBreakdown data={byCategory} />
      </div>

      {/* ── Recent Entries ── */}
      <SectionHeader label="Recent Entries" meta={`${transactions.length} items`} />
      <div className="border-b border-cream-border">
        <RecentTransactions transactions={transactions} onDelete={remove} />
      </div>

      {/* ── Footer ── */}
      <p className="font-mono text-center text-[10px] text-ink-muted py-8 tracking-wider">
        // log via LINE → &quot;ข้าว 50&quot; · &quot;เงินเดือน 30000&quot;
      </p>

    </main>
  )
}

function SectionHeader({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-2.5 border-b border-cream-border bg-cream-dark">
      <span className="font-mono text-[8px] tracking-[0.35em] text-ink-muted uppercase">{label}</span>
      {meta && <span className="font-mono text-[8px] text-ink-muted">{meta}</span>}
    </div>
  )
}
