import { SlidersHorizontal } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { formatRupiah } from '../../utils/currency'
import { formatFullDate } from '../../utils/date'

export function SummaryCard({ month, totalSpent, remaining, onEdit, onIncomeClick }) {
  const spentPct = month.income > 0 ? Math.min(Math.round((totalSpent / month.income) * 100), 100) : 0

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-xl shadow-violet-300/40">
      {/* Dekoratif */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10 blur-sm" />
      <div className="pointer-events-none absolute -bottom-10 left-2 h-32 w-32 rounded-full bg-indigo-400/20 blur-md" />
      <div className="pointer-events-none absolute right-12 bottom-4 h-16 w-16 rounded-full bg-violet-300/20" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Bulan Aktif
            </p>
            <p className="text-sm font-bold text-white/90 mt-0.5">{month.name}</p>
            <p className="text-[11px] font-medium text-white/60 mt-0.5 capitalize">
              {formatFullDate()}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {/* Toggle tema — hanya muncul di mobile, desktop pakai sidebar */}
            <ThemeToggle
              className="lg:hidden text-white/70 hover:bg-white/15 hover:text-white"
              iconClassName="text-white/70"
            />
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white/70 transition-colors hover:bg-white/25 hover:text-white"
                aria-label="Edit budget"
              >
                <SlidersHorizontal size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Sisa uang */}
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">
          Sisa Uang
        </p>
        <p className="text-[2.6rem] font-black tracking-tight leading-none mb-5">
          {formatRupiah(remaining)}
        </p>

        {/* Progress bar spending */}
        <div className="mb-5">
          <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-white/80 transition-all duration-700"
              style={{ width: `${spentPct}%` }}
            />
          </div>
          <p className="text-[11px] text-white/50 mt-1">{spentPct}% dari pemasukan terpakai</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onIncomeClick}
            className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm text-left transition-colors hover:bg-white/20 active:scale-[0.98]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">
              Pemasukan ›
            </p>
            <p className="text-sm font-bold text-white">{formatRupiah(month.income)}</p>
          </button>
          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">
              Pengeluaran
            </p>
            <p className="text-sm font-bold text-white">{formatRupiah(totalSpent)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
