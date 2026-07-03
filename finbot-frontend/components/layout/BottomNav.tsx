'use client'

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function BudgetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function AccountsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const tabs = [
  { id: 'dashboard', label: 'Home', Icon: HomeIcon },
  { id: 'budget', label: 'Budget', Icon: BudgetIcon },
  { id: 'accounts', label: 'Accounts', Icon: AccountsIcon },
  { id: 'more', label: 'More', Icon: MoreIcon },
]

export function BottomNav({ active = 'dashboard' }: { active?: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 flex safe-bottom z-50">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            disabled={!isActive}
            className={`flex-1 flex flex-col items-center pt-2.5 pb-1 gap-1 transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-300 cursor-default'
            }`}
          >
            <Icon />
            <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-gray-300'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
