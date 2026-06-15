import { useNavigate } from 'react-router-dom'
import { ChevronRight, PiggyBank } from 'lucide-react'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { formatRupiah } from '../../utils/currency'
import { isSavings } from '../../utils/savings'

const STATUS = {
  danger: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-red-200 dark:ring-red-800/50',
  },
  warning: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-amber-200 dark:ring-amber-800/50',
  },
  safe: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800/50',
  },
}

function getStatus(pct) {
  if (pct >= 100) return STATUS.danger
  if (pct >= 70)  return STATUS.warning
  return STATUS.safe
}

export function CategoryCard({ stat, readOnly = false }) {
  const navigate = useNavigate()
  const s = getStatus(stat.percentage)
  const savings = isSavings(stat)

  return (
    <Card
      className={`p-4 ${!readOnly ? 'cursor-pointer hover:shadow-[0_4px_20px_-2px_rgba(109,40,217,0.12)] dark:hover:shadow-[0_4px_20px_-2px_rgba(109,40,217,0.2)] transition-shadow duration-200' : ''}`}
      onClick={readOnly ? undefined : () => navigate(`/category/${stat.id}`)}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${savings ? 'bg-violet-100 dark:bg-violet-900/40' : s.bg}`}>
          {savings ? (
            <PiggyBank size={18} className="text-violet-600 dark:text-violet-400" />
          ) : (
            <span className={`text-sm font-black ${s.text}`}>
              {stat.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{stat.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {savings ? 'Ditabung' : 'Budget'} {formatRupiah(stat.budget)}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ring-1 ${s.badge}`}>
            {stat.percentage}%
          </span>
          {!readOnly && <ChevronRight size={15} className="text-slate-300 dark:text-slate-600" />}
        </div>
      </div>

      <ProgressBar percentage={stat.percentage} />

      <div className="flex justify-between mt-2.5 text-xs">
        <span className="text-slate-400 dark:text-slate-500">
          Terpakai{' '}
          <span className="font-bold text-slate-700 dark:text-slate-300">{formatRupiah(stat.spent)}</span>
        </span>
        <span className="text-slate-400 dark:text-slate-500">
          Sisa{' '}
          <span className="font-bold text-slate-700 dark:text-slate-300">{formatRupiah(stat.remaining)}</span>
        </span>
      </div>
    </Card>
  )
}
