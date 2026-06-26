import { useNavigate } from 'react-router-dom'
import { Wallet, ArrowDownLeft } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { formatRupiah } from '../utils/currency'
import { formatDateTime } from '../utils/date'

export default function IncomeHistory() {
  const navigate = useNavigate()
  const { activeMonth } = useBudgetContext()

  const catMap = Object.fromEntries(
    (activeMonth?.categories ?? []).map(c => [c.id, c])
  )

  const incomes = [...(activeMonth?.incomes ?? [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const total = incomes.reduce((sum, inc) => sum + inc.amount, 0)

  return (
    <PageWrapper title="Riwayat Pemasukan">
      <div className="flex flex-col gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Tercatat
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatRupiah(total)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
            <Wallet size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>

        {incomes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-300 dark:text-slate-600">
            <Wallet size={36} strokeWidth={1.2} />
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
              Belum ada pemasukan tercatat
            </p>
            <button
              onClick={() => navigate('/income')}
              className="mt-1 text-sm font-semibold text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Tambah pemasukan →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {incomes.map(inc => {
              const cat = catMap[inc.categoryId]
              return (
                <Card key={inc.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <ArrowDownLeft size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                        {inc.description || 'Pemasukan'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {(cat?.name ?? '—')} · {formatDateTime(inc.createdAt)}
                      </p>
                    </div>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      + {formatRupiah(inc.amount)}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
