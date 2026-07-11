import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Check, X, Search } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useToast } from '../context/ToastContext'
import { useBudget } from '../hooks/useBudget'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatRupiah } from '../utils/currency'
import { formatDateTime } from '../utils/date'
import { toTitleCase } from '../utils/text'
import { evalAmount } from '../utils/math'
import { AmountInput } from '../components/ui/AmountInput'

const editInputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600'

export default function CategoryDetail() {
  const { id, monthId } = useParams()
  const navigate = useNavigate()
  const { activeMonth, months, editExpense, deleteExpense } = useBudgetContext()
  const toast = useToast()

  // Mode riwayat: lihat kategori bulan lama (read-only, tanpa edit/hapus)
  const readOnly = !!monthId
  const month = monthId ? months.find(m => m.id === monthId) : activeMonth
  const { categoryStats } = useBudget(month)

  const [editingId, setEditingId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editError, setEditError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [query, setQuery] = useState('')

  const stat = categoryStats.find(c => c.id === id)

  if (!stat) {
    navigate(readOnly ? `/history/${monthId}` : '/')
    return null
  }

  const expenses = (month?.expenses ?? [])
    .filter(e => e.categoryId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const q = query.trim().toLowerCase()
  const visible = q
    ? expenses.filter(e => (e.description ?? '').toLowerCase().includes(q))
    : expenses

  function startEdit(expense) {
    setEditingId(expense.id)
    setEditAmount(expense.amount.toString())
    setEditDesc(expense.description)
    setEditError('')
  }

  function confirmEdit() {
    setEditError('')
    const evaluated = evalAmount(editAmount)
    if (isNaN(evaluated) || evaluated <= 0) {
      return setEditError('Nominal tidak valid.')
    }
    // Guard budget: sisa kategori + nominal lama = batas maksimal nominal baru
    const original = expenses.find(e => e.id === editingId)
    const maxAllowed = stat.remaining + (original?.amount ?? 0)
    if (evaluated > maxAllowed) {
      return setEditError(`Nominal melebihi sisa budget kategori ini (maks. ${formatRupiah(maxAllowed)}).`)
    }
    editExpense(activeMonth.id, editingId, {
      amount: evaluated,
      description: toTitleCase(editDesc),
    })
    setEditingId(null)
  }

  function confirmDelete() {
    deleteExpense(activeMonth.id, deleteId)
    setDeleteId(null)
    toast?.showToast('Pengeluaran dihapus', 'success')
  }

  return (
    <PageWrapper title={stat.name} backTo={readOnly ? `/history/${monthId}` : '/'}>
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <ProgressBar percentage={stat.percentage} />
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Terpakai:{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-100">{formatRupiah(stat.spent)}</span>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Sisa:{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-100">{formatRupiah(stat.remaining)}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Budget: {formatRupiah(stat.budget)}</p>
        </Card>

        <div className="flex flex-col gap-2">
          {/* Pencarian pengeluaran di kategori ini */}
          {expenses.length > 0 && (
            <div className="relative mb-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari pengeluaran…"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pl-9 pr-9 py-2.5 text-sm text-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {expenses.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-slate-500 py-8 text-sm">
              Belum ada pengeluaran di kategori ini
            </p>
          ) : visible.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-slate-500 py-8 text-sm">
              Tidak ada pengeluaran cocok dengan “{query.trim()}”
            </p>
          ) : null}

          {visible.map(exp => (
            <Card key={exp.id} className="p-4">
              {editingId === exp.id ? (
                <div className="flex flex-col gap-2">
                  <AmountInput
                    value={editAmount}
                    onChange={setEditAmount}
                    inputClassName={editInputCls}
                  />
                  <input
                    className={editInputCls}
                    type="text"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Keterangan"
                  />
                  {editError && (
                    <p className="text-xs text-red-500 dark:text-red-400 pl-1">{editError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={confirmEdit}
                      className="flex-1 py-2 text-sm flex items-center justify-center gap-1"
                    >
                      <Check size={14} /> Simpan
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="flex-1 py-2 text-sm flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-600"
                    >
                      <X size={14} /> Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{exp.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatDateTime(exp.createdAt)}</p>
                    <p className="font-semibold text-violet-600 dark:text-violet-400 mt-1">{formatRupiah(exp.amount)}</p>
                  </div>
                  {!readOnly && (
                    <div className="flex gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => startEdit(exp)}
                        className="text-slate-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 transition-colors p-1.5"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(exp.id)}
                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5"
                        aria-label="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Hapus Pengeluaran?"
        message="Pengeluaran ini akan dihapus permanen dari catatan bulan ini."
        confirmLabel="Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </PageWrapper>
  )
}
