export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white dark:focus:bg-slate-700 transition-all ${
          error
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
            : 'border-slate-200 dark:border-slate-600'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</span>}
    </div>
  )
}
