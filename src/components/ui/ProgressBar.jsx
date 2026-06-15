export function ProgressBar({ percentage }) {
  const clamped = Math.min(percentage, 100)
  const gradient =
    percentage >= 100
      ? 'bg-gradient-to-r from-red-500 to-rose-500'
      : percentage >= 70
      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
      : 'bg-gradient-to-r from-emerald-400 to-teal-500'

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${gradient}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
