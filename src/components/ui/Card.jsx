export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-white/80 dark:border-slate-700/40 shadow-[0_2px_16px_-2px_rgba(109,40,217,0.08),0_1px_4px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_-2px_rgba(0,0,0,0.3)] ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
