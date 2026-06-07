export type TransactionType = 'expense' | 'income'

export interface Transaction {
  id: number
  wallet_id: number
  user_id: number
  type: TransactionType
  amount: number
  category: string
  note: string
  raw_message?: string
  transaction_date: string
  created_at: string
}

export interface Wallet {
  id: number
  user_id: number
  name: string
  currency: string
  timezone: string
  is_default: boolean
  created_at: string
}

export interface MonthlySummary {
  total_income: number
  total_expense: number
  net: number
  daily_totals: DailyTotal[] | null
}

export interface DailyTotal {
  date: string
  income: number
  expense: number
}

export interface CategorySummary {
  category: string
  total: number
  count: number
}

export interface CreateTransactionInput {
  wallet_id: number
  type: TransactionType
  amount: number
  category: string
  note: string
  date: string
}

export interface CreateWalletInput {
  name: string
  currency: string
  timezone: string
}
