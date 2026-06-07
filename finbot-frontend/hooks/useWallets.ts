'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Wallet } from '@/types/finance'

export function useWallets(enabled = true) {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [activeWallet, setActiveWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallets = useCallback(async () => {
    try {
      const data = await api.wallets.list()
      setWallets(data)
      setActiveWallet(data.find((w) => w.is_default) ?? data[0] ?? null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      console.error('fetchWallets:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (enabled) fetchWallets() }, [fetchWallets, enabled])

  const switchWallet = useCallback((wallet: Wallet) => {
    setActiveWallet(wallet)
  }, [])

  return { wallets, activeWallet, switchWallet, loading, error, refetch: fetchWallets }
}
