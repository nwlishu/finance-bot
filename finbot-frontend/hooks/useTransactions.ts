'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Transaction } from '@/types/finance'

export function useTransactions(walletId: number | undefined, params?: Record<string, string>) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!walletId) return
    setLoading(true)
    try {
      const data = await api.transactions.list(walletId, params)
      setTransactions(data)
    } catch (err) {
      console.error('useTransactions:', err)
    } finally {
      setLoading(false)
    }
  }, [walletId, JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  const remove = useCallback(async (id: number) => {
    await api.transactions.delete(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { transactions, loading, refetch: fetch, remove }
}
