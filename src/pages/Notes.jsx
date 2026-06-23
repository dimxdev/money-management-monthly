import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, HandCoins } from 'lucide-react'
import { useStorage } from '../hooks/useStorage'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatRupiah } from '../utils/currency'
import { formatDate } from '../utils/date'
import { toTitleCase } from '../utils/text'
import { evalAmount } from '../utils/math'
import { AmountInput } from '../components/ui/AmountInput'

const STORAGE_KEY = 'money-tracker-notes'
const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600 dark:focus:bg-slate-700'

export default function Notes() {
  const [notes, setNotes] = useStorage(STORAGE_KEY, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [debtType, setDebtType] = useState(null)
  const [error, setError] = useState('')

  const sorted = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  function openAdd() {
    setEditingId(null)
    setTitle('')
    setAmount('')
    setDebtType(null)
    setError('')
    setModalOpen(true)
  }

  function openEdit(note) {
    setEditingId(note.id)
    setTitle(note.title)
    setAmount(note.amount.toString())
    setDebtType(note.debtType ?? null)
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function handleSave() {
    setError('')
    if (!title.trim()) return setError('Judul / keterangan tidak boleh kosong.')
    const evaluated = evalAmount(amount)
    if (isNaN(evaluated) || evaluated <= 0) return setError('Nominal tidak valid.')

    const payload = { title: toTitleCase(title), amount: evaluated, debtType: debtType ?? null }

    if (editingId) {
      setNotes(prev => prev.map(n => (n.id === editingId ? { ...n, ...payload } : n)))
    } else {
      setNotes(prev => [
        ...prev,
        {
          id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          ...payload,
          createdAt: new Date().toISOString(),
        },
      ])
    }
    closeModal()
  }

  function handleDelete(id) {
    if (window.confirm('Hapus catatan ini?')) {
      setNotes(prev => prev.filter(n => n.id !== id))
    }
  }

  return (
    <PageWrapper title="Hutang / Catatan">
      <div className="flex flex-col gap-4">
        {/* Penjelasan singkat menu */}
        <Card className="p-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-300/40 dark:shadow-violet-900/50">
            <HandCoins size={20} className="text-white" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Catatan Hutang &amp; Piutang</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Pengingat hutang ke orang lain atau sebaliknya. Murni catatan — tidak
              memengaruhi saldo maupun budget kamu.
            </p>
          </div>
        </Card>

        {/* List catatan */}
        <div className="flex flex-col gap-2">
          {sorted.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400 dark:text-slate-500">Belum ada catatan.</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                Tap tombol + untuk menambah hutang / piutang.
              </p>
            </div>
          ) : (
            sorted.map(note => (
              <Card key={note.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-800 dark:text-slate-100 break-words">{note.title}</p>
                      {note.debtType === 'lending' && (
                        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Meminjamkan
                        </span>
                      )}
                      {note.debtType === 'borrowing' && (
                        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          Meminjam
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(note.createdAt)}</p>
                    <p className="font-semibold text-violet-600 dark:text-violet-400 mt-1">{formatRupiah(note.amount)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(note)}
                      className="text-slate-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 transition-colors p-1.5"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5"
                      aria-label="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Tombol tambah (FAB) — kanan bawah, di atas bottom nav saat mobile */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-300/50 dark:shadow-violet-900/60 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Tambah catatan"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Modal tambah / edit */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <Card className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-slate-100">
                  {editingId ? 'Edit Catatan' : 'Tambah Catatan'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                  aria-label="Tutup"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Jenis <span className="text-slate-400 dark:text-slate-500 font-normal">(opsional)</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDebtType(prev => prev === 'lending' ? null : 'lending')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      debtType === 'lending'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-green-400 dark:hover:border-green-600 hover:text-green-600 dark:hover:text-green-400'
                    }`}
                  >
                    Meminjamkan
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType(prev => prev === 'borrowing' ? null : 'borrowing')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      debtType === 'borrowing'
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-red-400 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    Meminjam
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Judul / Keterangan</label>
                <input
                  className={inputCls}
                  type="text"
                  placeholder="Contoh: Pinjam ke Budi / Andi hutang ke saya"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nominal</label>
                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={closeModal}
                  className="flex-1 py-3 flex items-center justify-center gap-1"
                >
                  <X size={16} /> Batal
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 py-3 flex items-center justify-center gap-1"
                >
                  <Check size={16} /> Simpan
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
