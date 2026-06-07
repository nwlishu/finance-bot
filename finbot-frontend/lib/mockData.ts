import type { CategorySummary, MonthlySummary, Transaction, Wallet } from '@/types/finance'

export const MOCK_WALLETS: Wallet[] = [
  { id: 1, user_id: 1, name: 'กระเป๋าหลัก', currency: 'THB', timezone: 'Asia/Bangkok', is_default: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, user_id: 1, name: 'ออมทรัพย์', currency: 'THB', timezone: 'Asia/Bangkok', is_default: false, created_at: '2026-01-01T00:00:00Z' },
]

export const MOCK_MONTHLY: MonthlySummary = {
  total_income: 30000,
  total_expense: 5420,
  net: 24580,
  daily_totals: [
    { date: '2026-06-01', income: 30000, expense: 150 },
    { date: '2026-06-02', income: 0, expense: 200 },
    { date: '2026-06-03', income: 0, expense: 300 },
    { date: '2026-06-04', income: 0, expense: 85 },
    { date: '2026-06-05', income: 0, expense: 1200 },
    { date: '2026-06-06', income: 0, expense: 120 },
    { date: '2026-06-07', income: 0, expense: 3365 },
  ],
}

export const MOCK_BY_CATEGORY: CategorySummary[] = [
  { category: 'food', total: 1850, count: 8 },
  { category: 'shopping', total: 1500, count: 2 },
  { category: 'utilities', total: 1200, count: 2 },
  { category: 'transport', total: 570, count: 4 },
  { category: 'health', total: 300, count: 1 },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, wallet_id: 1, user_id: 1, type: 'income', amount: 30000, category: 'salary', note: 'เงินเดือน', transaction_date: '2026-06-01', created_at: '2026-06-01T09:00:00Z' },
  { id: 2, wallet_id: 1, user_id: 1, type: 'expense', amount: 1500, category: 'shopping', note: 'เสื้อผ้า', transaction_date: '2026-06-05', created_at: '2026-06-05T14:00:00Z' },
  { id: 3, wallet_id: 1, user_id: 1, type: 'expense', amount: 850, category: 'utilities', note: 'ค่าไฟ', transaction_date: '2026-06-03', created_at: '2026-06-03T10:00:00Z' },
  { id: 4, wallet_id: 1, user_id: 1, type: 'expense', amount: 350, category: 'utilities', note: 'ค่าน้ำ + เน็ต', transaction_date: '2026-06-03', created_at: '2026-06-03T10:05:00Z' },
  { id: 5, wallet_id: 1, user_id: 1, type: 'expense', amount: 300, category: 'health', note: 'ซื้อยา', transaction_date: '2026-06-07', created_at: '2026-06-07T11:00:00Z' },
  { id: 6, wallet_id: 1, user_id: 1, type: 'expense', amount: 280, category: 'transport', note: 'น้ำมัน', transaction_date: '2026-06-06', created_at: '2026-06-06T08:00:00Z' },
  { id: 7, wallet_id: 1, user_id: 1, type: 'expense', amount: 450, category: 'food', note: 'ร้านอาหาร', transaction_date: '2026-06-07', created_at: '2026-06-07T19:00:00Z' },
  { id: 8, wallet_id: 1, user_id: 1, type: 'expense', amount: 120, category: 'food', note: 'กาแฟ + ขนม', transaction_date: '2026-06-04', created_at: '2026-06-04T09:30:00Z' },
  { id: 9, wallet_id: 1, user_id: 1, type: 'expense', amount: 65, category: 'food', note: 'ข้าวเที่ยง', transaction_date: '2026-06-07', created_at: '2026-06-07T12:00:00Z' },
  { id: 10, wallet_id: 1, user_id: 1, type: 'expense', amount: 290, category: 'transport', note: 'แท็กซี่ + BTS', transaction_date: '2026-06-02', created_at: '2026-06-02T08:00:00Z' },
]
