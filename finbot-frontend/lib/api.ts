import type {
  CategorySummary,
  CreateTransactionInput,
  CreateWalletInput,
  MonthlySummary,
  Transaction,
  Wallet,
} from '@/types/finance'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined' ? (window as any).__liff_token__ : null

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${text}`)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  transactions: {
    list: (
      walletId: number,
      params?: Record<string, string>
    ): Promise<Transaction[]> => {
      const qs = new URLSearchParams({ wallet_id: String(walletId), ...params }).toString()
      return apiFetch(`/api/transactions?${qs}`)
    },
    create: (data: CreateTransactionInput): Promise<Transaction> =>
      apiFetch('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number): Promise<void> =>
      apiFetch(`/api/transactions/${id}`, { method: 'DELETE' }),
  },

  wallets: {
    list: (): Promise<Wallet[]> => apiFetch('/api/wallets'),
    create: (data: CreateWalletInput): Promise<Wallet> =>
      apiFetch('/api/wallets', { method: 'POST', body: JSON.stringify(data) }),
    setDefault: (id: number): Promise<void> =>
      apiFetch(`/api/wallets/${id}/default`, { method: 'PUT' }),
  },

  summary: {
    monthly: (
      walletId: number,
      year: number,
      month: number
    ): Promise<MonthlySummary> =>
      apiFetch(`/api/summary/monthly?wallet_id=${walletId}&year=${year}&month=${month}`),
    byCategory: (
      walletId: number,
      from: string,
      to: string
    ): Promise<CategorySummary[]> =>
      apiFetch(`/api/summary/by-category?wallet_id=${walletId}&from=${from}&to=${to}`),
  },
}
