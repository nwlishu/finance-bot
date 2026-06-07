'use client'
import type { Wallet } from '@/types/finance'

interface Props {
  wallets: Wallet[]
  active: Wallet | null
  onChange: (w: Wallet) => void
}

export function WalletSelector({ wallets, active, onChange }: Props) {
  if (wallets.length === 0) return null
  return (
    <div className="flex border border-cream-border overflow-hidden divide-x divide-cream-border">
      {wallets.map((w) => (
        <button
          key={w.id}
          onClick={() => onChange(w)}
          className={`flex-1 px-4 py-2.5 font-mono text-xs tracking-wider transition-colors text-left ${
            active?.id === w.id
              ? 'bg-ink text-cream'
              : 'bg-transparent text-ink-light hover:bg-cream-dark'
          }`}
        >
          <span className={`mr-1.5 ${active?.id === w.id ? 'text-vermilion' : 'text-cream-deep'}`}>
            {active?.id === w.id ? '▶' : '○'}
          </span>
          {w.name}
        </button>
      ))}
    </div>
  )
}
