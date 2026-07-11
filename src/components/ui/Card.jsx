export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl backdrop-saturate-150 rounded-2xl border border-white/70 dark:border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65),0_2px_16px_-2px_rgba(109,40,217,0.10),0_1px_4px_-1px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_2px_16px_-2px_rgba(0,0,0,0.35)] ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
