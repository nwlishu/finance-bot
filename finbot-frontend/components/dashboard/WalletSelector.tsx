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
    <div className="flex gap-2 px-4 py-3 overflow-x-auto">
      {wallets.map((w) => (
        <button
          key={w.id}
          onClick={() => onChange(w)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            active?.id === w.id
              ? 'bg-[#1E3560] text-white shadow-sm'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          {w.name}
        </button>
      ))}
    </div>
  )
}
