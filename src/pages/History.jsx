import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useBudget } from '../hooks/useBudget'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { SummaryCard } from '../components/dashboard/SummaryCard'
import { CategoryCard } from '../components/dashboard/CategoryCard'
import { SpendingChart } from '../components/dashboard/SpendingChart'
import { formatRupiah } from '../utils/currency'

function HistoryList() {
  const { months } = useBudgetContext()
  const navigate = useNavigate()
  const sorted = [...months].sort((a, b) => b.id.localeCompare(a.id))

  return (
    <PageWrapper title="Riwayat">
      <div className="flex flex-col gap-3">
        {sorted.length === 0 && (
          <p className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm">
            Belum ada data bulan
          </p>
        )}
        {sorted.map(month => {
          const totalSpent = month.expenses.reduce((s, e) => s + e.amount, 0)
          const remaining = month.income - totalSpent
          return (
            <Card
              key={month.id}
              className="p-4 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/60 hover:shadow-md transition-shadow"
              onClick={() => navigate(`/history/${month.id}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{month.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Pengeluaran: {formatRupiah(totalSpent)}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Sisa: {formatRupiah(remaining)}
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
              </div>
            </Card>
          )
        })}
      </div>
    </PageWrapper>
  )
}

function HistoryDetail({ month }) {
  const { totalSpent, remaining, categoryStats } = useBudget(month)

  return (
    <PageWrapper title={month.name}>
      <div className="flex flex-col gap-4">
        <SummaryCard month={month} totalSpent={totalSpent} remaining={remaining} />
        <SpendingChart month={month} />
        {categoryStats.map(stat => (
          <CategoryCard key={stat.id} stat={stat} monthId={month.id} />
        ))}
      </div>
    </PageWrapper>
  )
}

export default function History() {
  const { monthId } = useParams()
  const { months } = useBudgetContext()

  if (monthId) {
    const month = months.find(m => m.id === monthId)
    if (month) return <HistoryDetail month={month} />
  }

  return <HistoryList />
}
