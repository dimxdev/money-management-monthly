import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, History, Settings, Wallet } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/add', icon: PlusCircle, label: 'Catat Pengeluaran', primary: true },
  { to: '/history', icon: History, label: 'Riwayat' },
  { to: '/settings', icon: Settings, label: 'Pengaturan' },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col bg-white dark:bg-slate-900 border-r border-violet-100/60 dark:border-slate-700/50 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-violet-50 dark:border-slate-700/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-300/50 dark:shadow-violet-900/50">
          <Wallet size={19} className="text-white" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <p className="text-base font-black text-slate-900 dark:text-slate-100">Money</p>
          <p className="text-base font-black text-violet-600 dark:text-violet-400 -mt-0.5">Tracker</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 px-3 py-5 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 mb-2">
          Menu
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label, primary, end }) => (
          <NavLink key={to} to={to} end={end}>
            {({ isActive }) => (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive && primary
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/50'
                    : isActive
                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                    : primary
                    ? 'text-violet-500 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-violet-50 dark:border-slate-700/50 flex items-center justify-between gap-2">
        <div className="leading-tight">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Data tersimpan di browser</p>
          <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-0.5">Settings → Export untuk backup</p>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  )
}
