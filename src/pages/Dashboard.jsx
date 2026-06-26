import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Receipt, PlusCircle, Wallet } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useBudget } from '../hooks/useBudget'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { SummaryCard } from '../components/dashboard/SummaryCard'
import { CategoryCard } from '../components/dashboard/CategoryCard'
import { SpendingChart } from '../components/dashboard/SpendingChart'
import { formatRupiah } from '../utils/currency'
import { formatDate } from '../utils/date'

function RecentPanel({ activeMonth }) {
  const navigate = useNavigate()
  const catMap = Object.fromEntries(
    (activeMonth?.categories ?? []).map(c => [c.id, c])
  )
  const recent = [...(activeMonth?.expenses ?? [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)

  return (
    <Card className="p-5 flex flex-col gap-4 sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Transaksi Terbaru</h3>
        <Receipt size={15} className="text-slate-300 dark:text-slate-600" />
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300 dark:text-slate-600">
          <Receipt size={32} strokeWidth={1.2} />
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Belum ada transaksi</p>
          <button
            onClick={() => navigate('/add')}
            className="mt-1 text-xs font-semibold text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
          >
            Catat sekarang →
          </button>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-50/80 dark:divide-slate-700/50">
          {recent.map(exp => {
            const cat = catMap[exp.categoryId]
            return (
              <div key={exp.id} className="flex items-center gap-3 py-3">
                <div className="h-8 w-8 shrink-0 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                    {(cat?.name ?? '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                    {exp.description}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {cat?.name ?? '—'} · {formatDate(exp.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-bold text-violet-600 dark:text-violet-400 shrink-0">
                  {formatRupiah(exp.amount)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { activeMonth } = useBudgetContext()
  const { totalSpent, remaining, unallocated, categoryStats } = useBudget(activeMonth)

  return (
    <PageWrapper wide>
      <div className="flex flex-col gap-4">
        <SummaryCard
          month={activeMonth}
          totalSpent={totalSpent}
          remaining={remaining}
          onEdit={() => navigate('/setup')}
          onIncomeClick={() => navigate('/income-history')}
        />

        {/* Aksi cepat */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/add')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-semibold py-3 shadow-md shadow-violet-200 dark:shadow-violet-900/50 active:scale-[0.98] transition-transform"
          >
            <PlusCircle size={18} /> Catat Pengeluaran
          </button>
          <button
            onClick={() => navigate('/income')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-[#1B2A6B] text-white font-semibold py-3 shadow-md shadow-blue-200 dark:shadow-blue-900/50 active:scale-[0.98] transition-transform"
          >
            <Wallet size={18} /> Tambah Pemasukan
          </button>
        </div>

        {unallocated > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              Belum dialokasikan: {formatRupiah(unallocated)}
            </p>
          </div>
        )}

        <SpendingChart month={activeMonth} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="flex flex-col gap-3">
            <p className="hidden lg:block text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Kategori Budget
            </p>
            {categoryStats.length === 0 ? (
              <p className="text-center text-slate-400 dark:text-slate-500 py-10 text-sm">Belum ada kategori</p>
            ) : (
              categoryStats.map(stat => (
                <CategoryCard key={stat.id} stat={stat} />
              ))
            )}
          </div>

          <div className="hidden lg:block">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Aktivitas
            </p>
            <RecentPanel activeMonth={activeMonth} />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
