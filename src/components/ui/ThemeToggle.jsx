import { Sun, Moon } from 'lucide-react'
import { useDarkMode } from '../../hooks/useDarkMode'

export function ThemeToggle({ className = '', iconClassName = '' }) {
  const { isDark, toggle } = useDarkMode()
  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-xl transition-colors ${className || 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <Sun size={18} className={iconClassName} />
        : <Moon size={18} className={iconClassName} />}
    </button>
  )
}
