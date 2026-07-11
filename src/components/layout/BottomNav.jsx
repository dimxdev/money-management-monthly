import { NavLink } from 'react-router-dom'
import { LayoutDashboard, History, Settings, HandCoins, PieChart } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Beranda', end: true },
  { to: '/analytics', icon: PieChart, label: 'Analitik' },
  { to: '/notes', icon: HandCoins, label: 'Hutang' },
  { to: '/history', icon: History, label: 'Riwayat' },
  { to: '/settings', icon: Settings, label: 'Pengaturan' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden">
      <div className="bg-white/60 dark:bg-slate-900/55 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/60 dark:border-white/10 shadow-[0_-8px_32px_-12px_rgba(31,38,135,0.18)] dark:shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex h-16">
          {NAV_ITEMS.map(({ to, icon: Icon, label, primary, end }) => (
            <NavLink key={to} to={to} end={end} className="flex-1">
              {({ isActive }) =>
                primary ? (
                  <div className="h-full flex flex-col items-center justify-center gap-0.5">
                    <div
                      className={`flex flex-col items-center justify-center gap-0.5 w-full mx-3 py-1.5 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-300/40 dark:shadow-violet-900/60'
                          : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                      }`}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                      <span className="text-[10px] font-bold">{label}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`h-full flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200 active:scale-90 ${
                      isActive
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
                    )}
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {label}
                    </span>
                  </div>
                )
              }
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
