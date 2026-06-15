export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary:
      'bg-gradient-to-br from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/50 active:shadow-none active:scale-[0.98]',
    secondary:
      'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/50 active:shadow-none active:scale-[0.98]',
    danger:
      'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md shadow-red-200 dark:shadow-red-900/50 active:shadow-none active:scale-[0.98]',
    ghost:
      'bg-white/70 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm active:scale-[0.98]',
  }
  return (
    <button
      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
