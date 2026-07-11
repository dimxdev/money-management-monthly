import { NavLink } from 'react-router-dom'
import { m as M } from 'motion/react'
import { LayoutDashboard, History, Settings, HandCoins, PieChart } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Beranda', end: true },
  { to: '/analytics', icon: PieChart, label: 'Analitik' },
  { to: '/notes', icon: HandCoins, label: 'Hutang' },
  { to: '/history', icon: History, label: 'Riwayat' },
  { to: '/settings', icon: Settings, label: 'Pengaturan' },
]

const navSpring = { type: 'spring', stiffness: 500, damping: 35 }

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden">
      <div className="bg-white/60 dark:bg-slate-900/55 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/60 dark:border-white/10 shadow-[0_-8px_32px_-12px_rgba(31,38,135,0.18)] dark:shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex h-16">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className="flex-1">
              {({ isActive }) => (
                <div
                  className={`h-full flex flex-col items-center justify-center gap-0.5 relative transition-colors duration-200 active:scale-90 ${
                    isActive
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isActive && (
                    <>
                      {/* Garis indikator — meluncur antar menu (shared layout) */}
                      <M.span
                        layoutId="bottomnav-line"
                        transition={navSpring}
                        className="absolute top-0 left-0 right-0 mx-auto w-6 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      />
                      {/* Glow lembut di belakang ikon aktif — ikut meluncur */}
                      <M.span
                        layoutId="bottomnav-glow"
                        transition={navSpring}
                        className="absolute top-1.5 left-0 right-0 mx-auto h-9 w-12 rounded-2xl bg-violet-500/10 dark:bg-violet-400/10"
                      />
                    </>
                  )}
                  <M.div
                    animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                    transition={navSpring}
                    className="relative"
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  </M.div>
                  <span className={`relative text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
