import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { m as M, AnimatePresence } from 'motion/react'
import { Wallet, ArrowDownLeft, Trash2, Pencil, Check, X } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useToast } from '../context/ToastContext'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { AmountInput } from '../components/ui/AmountInput'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatRupiah } from '../utils/currency'
import { formatDateTime } from '../utils/date'
import { toTitleCase } from '../utils/text'
import { evalAmount } from '../utils/math'
import { spring, modalSpring } from '../utils/motion'
import { Stagger, StaggerItem } from '../components/ui/Stagger'
import { SwipeRow } from '../components/ui/SwipeRow'

const labelCls = 'text-sm font-medium text-slate-700 dark:text-slate-300'
const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600 dark:focus:bg-slate-700'

export default function IncomeHistory() {
  const { monthId } = useParams()
  const navigate = useNavigate()
  const { activeMonth, months, editIncome, deleteIncome } = useBudgetContext()
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Modal edit pemasukan
  const [editTarget, setEditTarget] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCat, setEditCat] = useState('')
  const [editError, setEditError] = useState('')

  function openEdit(inc) {
    setEditTarget(inc)
    setEditAmount(inc.amount.toString())
    setEditDesc(inc.description ?? '')
    setEditCat(inc.categoryId ?? '')
    setEditError('')
  }

  function closeEdit() {
    setEditTarget(null)
    setEditError('')
  }

  function saveEdit() {
    setEditError('')
    const evaluated = evalAmount(editAmount)
    if (isNaN(evaluated) || evaluated <= 0) return setEditError('Nominal tidak valid.')
    if (!editCat) return setEditError('Pilih kategori alokasi.')

    const desc = toTitleCase(editDesc)
    const changed =
      evaluated !== editTarget.amount ||
      desc !== (editTarget.description ?? '') ||
      editCat !== editTarget.categoryId

    if (changed) {
      editIncome(month.id, editTarget.id, {
        amount: evaluated,
        description: desc,
        categoryId: editCat,
      })
      toast?.showToast('Pemasukan berhasil diedit', 'success')
    }
    closeEdit()
  }

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
      <Stagger className="flex flex-col gap-4">
        <StaggerItem>
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
        </StaggerItem>

        {incomes.length === 0 ? (
          <StaggerItem className="flex flex-col items-center justify-center py-16 gap-3 text-slate-300 dark:text-slate-600">
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
          </StaggerItem>
        ) : (
          <StaggerItem className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
            {incomes.map(inc => {
              const cat = catMap[inc.categoryId]
              return (
                <M.div
                  key={inc.id}
                  layout
                  transition={spring}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                <SwipeRow
                  disabled={readOnly}
                  actionWidth={128}
                  actions={
                    <>
                      <button
                        onClick={() => openEdit(inc)}
                        className="flex h-[calc(100%-10px)] w-14 flex-col items-center justify-center gap-1 rounded-2xl bg-violet-500 text-white shadow-md shadow-violet-300/40 dark:shadow-violet-900/40 active:scale-95 transition-transform"
                        aria-label="Edit pemasukan"
                      >
                        <Pencil size={16} />
                        <span className="text-[10px] font-bold">Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(inc)}
                        className="flex h-[calc(100%-10px)] w-14 flex-col items-center justify-center gap-1 rounded-2xl bg-red-500 text-white shadow-md shadow-red-300/40 dark:shadow-red-900/40 active:scale-95 transition-transform"
                        aria-label="Hapus pemasukan"
                      >
                        <Trash2 size={16} />
                        <span className="text-[10px] font-bold">Hapus</span>
                      </button>
                    </>
                  }
                >
                <Card className="p-4">
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
                      <div className="flex gap-0.5 shrink-0">
                        <button
                          onClick={() => openEdit(inc)}
                          className="text-slate-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 active:scale-90 transition-all duration-150 p-1.5"
                          aria-label="Edit pemasukan"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(inc)}
                          className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 active:scale-90 transition-all duration-150 p-1.5"
                          aria-label="Hapus pemasukan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
                </SwipeRow>
                </M.div>
              )
            })}
            </AnimatePresence>
          </StaggerItem>
        )}
      </Stagger>

      {/* Modal edit pemasukan */}
      <AnimatePresence>
        {editTarget && (
          <M.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeEdit}
          >
            <M.div
              className="w-full max-w-md"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={modalSpring}
              onClick={e => e.stopPropagation()}
            >
              <Card className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 dark:text-slate-100">Edit Pemasukan</h2>
                  <button
                    onClick={closeEdit}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 active:scale-90 transition-all duration-150 p-1"
                    aria-label="Tutup"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Nominal</label>
                  <AmountInput
                    value={editAmount}
                    onChange={setEditAmount}
                    previewColor="emerald"
                    previewPrefix="+ "
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelCls}>
                    Sumber <span className="font-normal text-slate-400 dark:text-slate-500">(opsional)</span>
                  </label>
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="Contoh: Gaji, Bonus, THR"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Alokasikan ke</label>
                  <select
                    className={inputCls}
                    value={editCat}
                    onChange={e => setEditCat(e.target.value)}
                  >
                    {(month.categories ?? []).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-1 leading-relaxed">
                    Mengubah nominal atau kategori otomatis menyesuaikan total pemasukan &amp; budget kategori terkait.
                  </p>
                </div>

                {editError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3">
                    <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={closeEdit}
                    className="flex-1 py-3 flex items-center justify-center gap-1"
                  >
                    <X size={16} /> Batal
                  </Button>
                  <Button
                    onClick={saveEdit}
                    className="flex-1 py-3 flex items-center justify-center gap-1"
                  >
                    <Check size={16} /> Simpan
                  </Button>
                </div>
              </Card>
            </M.div>
          </M.div>
        )}
      </AnimatePresence>

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
