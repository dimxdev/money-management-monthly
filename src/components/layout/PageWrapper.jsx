import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'

export function PageWrapper({ children, title, action, wide = false, backTo }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#EAF7FA] dark:bg-[#0B1026] pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-10">
      {/* Aurora backdrop — blob gradien statis di belakang konten, bikin efek glass kelihatan */}
      <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-300/40 to-sky-400/25 dark:from-violet-500/25 dark:to-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-gradient-to-br from-violet-300/30 to-indigo-400/25 dark:from-indigo-700/30 dark:to-purple-700/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-sky-300/30 to-emerald-200/25 dark:from-cyan-600/15 dark:to-indigo-800/25 blur-3xl" />
      </div>

      {title && (
        <div className="sticky top-0 bg-white/55 dark:bg-slate-900/55 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/60 dark:border-white/10 px-4 lg:px-8 py-4 z-10">
          <div className={`mx-auto flex items-center justify-between ${wide ? 'max-w-5xl' : 'max-w-lg lg:max-w-2xl'}`}>
            <div className="flex items-center gap-2 min-w-0">
              {backTo && (
                <button
                  type="button"
                  onClick={() => navigate(backTo)}
                  aria-label="Kembali"
                  className="flex h-8 w-8 shrink-0 -ml-1 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                >
                  <ArrowLeft size={19} />
                </button>
              )}
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {action}
              <ThemeToggle className="lg:hidden" />
            </div>
          </div>
        </div>
      )}
      <div className={`relative mx-auto px-4 lg:px-8 py-4 lg:py-6 ${wide ? 'max-w-5xl' : 'max-w-lg lg:max-w-2xl'}`}>
        {children}
      </div>
    </div>
  )
}
