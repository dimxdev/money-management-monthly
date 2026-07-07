import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'

export function PageWrapper({ children, title, action, wide = false, backTo }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#EAF7FA] dark:bg-[#0B1026] pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-10">
      {title && (
        <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-violet-100/60 dark:border-slate-700/50 px-4 lg:px-8 py-4 z-10">
          <div className={`mx-auto flex items-center justify-between ${wide ? 'max-w-5xl' : 'max-w-lg lg:max-w-2xl'}`}>
            <div className="flex items-center gap-2 min-w-0">
              {backTo && (
                <button
                  type="button"
                  onClick={() => navigate(backTo)}
                  aria-label="Kembali"
                  className="flex h-8 w-8 shrink-0 -ml-1 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
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
      <div className={`mx-auto px-4 lg:px-8 py-4 lg:py-6 ${wide ? 'max-w-5xl' : 'max-w-lg lg:max-w-2xl'}`}>
        {children}
      </div>
    </div>
  )
}
