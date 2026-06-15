import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useBudget } from '../hooks/useBudget'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatRupiah } from '../utils/currency'
import { formatDateTime } from '../utils/date'

const editInputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600'

export default function CategoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeMonth, editExpense, deleteExpense } = useBudgetContext()
  const { categoryStats } = useBudget(activeMonth)

  const [editingId, setEditingId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const stat = categoryStats.find(c => c.id === id)

  if (!stat) {
    navigate('/')
    return null
  }

  const expenses = (activeMonth?.expenses ?? [])
    .filter(e => e.categoryId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  function startEdit(expense) {
    setEditingId(expense.id)
    setEditAmount(expense.amount.toString())
    setEditDesc(expense.description)
  }

  function confirmEdit() {
    if (!editAmount || Number(editAmount) <= 0) return
    editExpense(activeMonth.id, editingId, {
      amount: Number(editAmount),
      description: editDesc,
    })
    setEditingId(null)
  }

  function handleDelete(expenseId) {
    if (window.confirm('Hapus pengeluaran ini?')) {
      deleteExpense(activeMonth.id, expenseId)
    }
  }

  return (
    <PageWrapper title={stat.name}>
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
          {expenses.length === 0 && (
            <p className="text-center text-slate-400 dark:text-slate-500 py-8 text-sm">
              Belum ada pengeluaran di kategori ini
            </p>
          )}

          {expenses.map(exp => (
            <Card key={exp.id} className="p-4">
              {editingId === exp.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    className={editInputCls}
                    type="number"
                    inputMode="numeric"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    placeholder="Nominal"
                  />
                  <input
                    className={editInputCls}
                    type="text"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Keterangan"
                  />
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
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => startEdit(exp)}
                      className="text-slate-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 transition-colors p-1.5"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5"
                      aria-label="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
