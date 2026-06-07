'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { CategorySummary, MonthlySummary } from '@/types/finance'

export function useSummary(walletId: number | undefined) {
  const [monthly, setMonthly] = useState<MonthlySummary | null>(null)
  const [byCategory, setByCategory] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(false)

  const now = new Date()

  const fetch = useCallback(async () => {
    if (!walletId) return
    setLoading(true)
    try {
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const to = now.toISOString().split('T')[0]

      const [m, c] = await Promise.all([
        api.summary.monthly(walletId, now.getFullYear(), now.getMonth() + 1),
        api.summary.byCategory(walletId, from, to),
      ])
      setMonthly(m)
      setByCategory(c ?? [])
    } catch (err) {
      console.error('useSummary:', err)
    } finally {
      setLoading(false)
    }
  }, [walletId])

  useEffect(() => { fetch() }, [fetch])

  return { monthly, byCategory, loading, refetch: fetch }
}
