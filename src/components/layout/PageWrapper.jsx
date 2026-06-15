import { ThemeToggle } from '../ui/ThemeToggle'

export function PageWrapper({ children, title, action, wide = false }) {
  return (
    <div className="min-h-screen bg-[#F0EEFF] dark:bg-[#0C0A1A] pb-24 lg:pb-10">
      {title && (
        <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-violet-100/60 dark:border-slate-700/50 px-4 lg:px-8 py-4 z-10">
          <div className={`mx-auto flex items-center justify-between ${wide ? 'max-w-5xl' : 'max-w-lg lg:max-w-2xl'}`}>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>
            <div className="flex items-center gap-1">
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
