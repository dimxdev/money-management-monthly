import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wallet, ArrowDownLeft, Trash2 } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useToast } from '../context/ToastContext'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatRupiah } from '../utils/currency'
import { formatDateTime } from '../utils/date'

export default function IncomeHistory() {
  const { monthId } = useParams()
  const navigate = useNavigate()
  const { activeMonth, months, deleteIncome } = useBudgetContext()
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Mode riwayat: lihat pemasukan bulan lama (read-only)
  const readOnly = !!monthId
  const month = monthId ? months.find(m => m.id === monthId) : activeMonth

  if (!month) {
    navigate('/history')
    return null
  }

  const catMap = Object.fromEntries(
    (month?.categories ?? []).map(c => [c.id, c])
  )

  const incomes = [...(month?.incomes ?? [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const total = incomes.reduce((sum, inc) => sum + inc.amount, 0)

  return (
    <PageWrapper
      title={readOnly ? `Pemasukan · ${month.name}` : 'Riwayat Pemasukan'}
      backTo={readOnly ? `/history/${monthId}` : '/'}
    >
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
            {!readOnly && (
              <button
                onClick={() => navigate('/income')}
                className="mt-1 text-sm font-semibold text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                Tambah pemasukan →
              </button>
            )}
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
                    {!readOnly && (
                      <button
                        onClick={() => setDeleteTarget(inc)}
                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 shrink-0"
                        aria-label="Hapus pemasukan"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Pemasukan?"
        message={
          deleteTarget
            ? `Pemasukan ${formatRupiah(deleteTarget.amount)} akan dihapus. Total pemasukan dan budget kategori ${catMap[deleteTarget.categoryId]?.name ?? 'terkait'} ikut dikurangi.`
            : ''
        }
        confirmLabel="Hapus"
        onConfirm={() => {
          deleteIncome(month.id, deleteTarget.id)
          setDeleteTarget(null)
          toast?.showToast('Pemasukan dihapus', 'success')
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  )
}
