import { useEffect, useState } from 'react'
// Alias `m as M` — ESLint config project ini hanya mengabaikan identifier kapital di JSX
import { m as M, AnimatePresence } from 'motion/react'
import { Plus, Pencil, Trash2, X, Check, HandCoins, ChevronDown, UserPlus, CheckCircle2, Undo2 } from 'lucide-react'
import { useStorage } from '../hooks/useStorage'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatRupiah } from '../utils/currency'
import { formatDate, toDatetimeLocal } from '../utils/date'
import { toTitleCase } from '../utils/text'
import { evalAmount } from '../utils/math'
import { spring, modalSpring } from '../utils/motion'
import { AmountInput } from '../components/ui/AmountInput'
import { Stagger, StaggerItem } from '../components/ui/Stagger'

const STORAGE_KEY = 'money-tracker-notes'
const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600 dark:focus:bg-slate-700'

// Migrasi format lama (array catatan datar) → format baru (array orang berisi items).
// Catatan lama tanpa pemilik dikumpulkan ke satu orang "Lainnya".
function isOldFormat(data) {
  return Array.isArray(data) && data.some(x => x && typeof x === 'object' && !('items' in x))
}
function migrate(data) {
  if (!Array.isArray(data)) return []
  if (!isOldFormat(data)) return data
  const legacy = data.filter(n => n && typeof n === 'object' && !('items' in n))
  const already = data.filter(n => n && typeof n === 'object' && 'items' in n)
  if (legacy.length === 0) return already
  return [
    ...already,
    {
      id: `person_${Date.now()}_legacy`,
      name: 'Lainnya',
      items: legacy.map(n => ({
        id: n.id,
        title: n.title,
        amount: n.amount,
        debtType: n.debtType ?? null,
        createdAt: n.createdAt,
      })),
    },
  ]
}

// Saldo bersih: meminjamkan (orang ngutang ke kamu) positif, meminjam (kamu ngutang) negatif.
// Catatan yang sudah lunas tidak ikut dihitung.
function netBalance(items = []) {
  return items.reduce((sum, it) => {
    if (it.settled) return sum
    if (it.debtType === 'lending') return sum + it.amount
    if (it.debtType === 'borrowing') return sum - it.amount
    return sum
  }, 0)
}

// Total piutang (semua "meminjamkan") & hutang (semua "meminjam") lintas orang, kecuali yang lunas.
function grandTotals(people = []) {
  return people.reduce((acc, p) => {
    for (const it of p.items ?? []) {
      if (it.settled) continue
      if (it.debtType === 'lending') acc.lending += it.amount
      else if (it.debtType === 'borrowing') acc.borrowing += it.amount
    }
    return acc
  }, { lending: 0, borrowing: 0 })
}

export default function Notes() {
  const [people, setPeople] = useStorage(STORAGE_KEY, [])

  // Migrasi sekali saat mount bila masih format lama.
  useEffect(() => {
    if (isOldFormat(people)) setPeople(migrate(people))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [expanded, setExpanded] = useState(() => new Set())

  // Modal orang
  const [personModal, setPersonModal] = useState(false)
  const [personEditId, setPersonEditId] = useState(null)
  const [personName, setPersonName] = useState('')
  const [personError, setPersonError] = useState('')

  // Modal hutang (item)
  const [itemModal, setItemModal] = useState(false)
  const [itemPersonId, setItemPersonId] = useState(null)
  const [itemEditId, setItemEditId] = useState(null)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [debtType, setDebtType] = useState(null)
  const [datetime, setDatetime] = useState('')
  const [itemError, setItemError] = useState('')

  const list = Array.isArray(people) ? people : []
  const totals = grandTotals(list)
  const totalNet = totals.lending - totals.borrowing

  // Orang yang saldonya sudah lunas (tidak ada hutang/piutang aktif) ditaruh paling bawah.
  const sortedList = [...list].sort((a, b) => {
    const aActive = netBalance(a.items ?? []) !== 0
    const bActive = netBalance(b.items ?? []) !== 0
    return aActive === bActive ? 0 : aActive ? -1 : 1
  })

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  /* ---------- Orang ---------- */
  function openAddPerson() {
    setPersonEditId(null)
    setPersonName('')
    setPersonError('')
    setPersonModal(true)
  }
  function openEditPerson(person) {
    setPersonEditId(person.id)
    setPersonName(person.name)
    setPersonError('')
    setPersonModal(true)
  }
  function savePerson() {
    setPersonError('')
    const name = toTitleCase(personName)
    if (!name.trim()) return setPersonError('Nama orang tidak boleh kosong.')

    if (personEditId) {
      setPeople(prev => prev.map(p => (p.id === personEditId ? { ...p, name } : p)))
    } else {
      const id = `person_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      setPeople(prev => [...prev, { id, name, items: [] }])
      setExpanded(prev => new Set(prev).add(id))
    }
    setPersonModal(false)
  }
  function deletePerson(id) {
    const person = list.find(p => p.id === id)
    const n = person?.items?.length ?? 0
    const msg = n > 0
      ? `Hapus "${person.name}" beserta ${n} catatan hutangnya?`
      : `Hapus "${person?.name}"?`
    if (window.confirm(msg)) {
      setPeople(prev => prev.filter(p => p.id !== id))
    }
  }

  /* ---------- Hutang (item) ---------- */
  function openAddItem(personId) {
    setItemPersonId(personId)
    setItemEditId(null)
    setTitle('')
    setAmount('')
    setDebtType(null)
    setDatetime(toDatetimeLocal())
    setItemError('')
    setItemModal(true)
  }
  function openEditItem(personId, item) {
    setItemPersonId(personId)
    setItemEditId(item.id)
    setTitle(item.title)
    setAmount(item.amount.toString())
    setDebtType(item.debtType ?? null)
    setDatetime(item.createdAt ? toDatetimeLocal(item.createdAt) : toDatetimeLocal())
    setItemError('')
    setItemModal(true)
  }
  function saveItem() {
    setItemError('')
    if (!title.trim()) return setItemError('Judul / keterangan tidak boleh kosong.')
    const evaluated = evalAmount(amount)
    if (isNaN(evaluated) || evaluated <= 0) return setItemError('Nominal tidak valid.')

    let createdAt = new Date().toISOString()
    if (datetime) {
      const d = new Date(datetime)
      if (isNaN(d.getTime())) return setItemError('Tanggal & waktu tidak valid.')
      createdAt = d.toISOString()
    }

    const payload = { title: toTitleCase(title), amount: evaluated, debtType: debtType ?? null, createdAt }

    setPeople(prev => prev.map(p => {
      if (p.id !== itemPersonId) return p
      if (itemEditId) {
        return { ...p, items: p.items.map(it => (it.id === itemEditId ? { ...it, ...payload } : it)) }
      }
      const newItem = {
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ...payload,
      }
      return { ...p, items: [...p.items, newItem] }
    }))
    setItemModal(false)
  }
  function deleteItem(personId, itemId) {
    if (window.confirm('Hapus catatan hutang ini?')) {
      setPeople(prev => prev.map(p =>
        p.id === personId ? { ...p, items: p.items.filter(it => it.id !== itemId) } : p
      ))
    }
  }
  // Tandai lunas / batal lunas — item lunas tetap tersimpan tapi tidak dihitung ke saldo.
  function toggleSettled(personId, itemId) {
    setPeople(prev => prev.map(p =>
      p.id === personId
        ? { ...p, items: p.items.map(it => (it.id === itemId ? { ...it, settled: !it.settled } : it)) }
        : p
    ))
  }

  return (
    <PageWrapper title="Hutang / Catatan">
      <Stagger className="flex flex-col gap-4">
        {/* Penjelasan singkat menu */}
        <StaggerItem>
        <Card className="p-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-300/40 dark:shadow-violet-900/50">
            <HandCoins size={20} className="text-white" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Catatan Hutang &amp; Piutang per Orang</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Tambah orang, lalu catat hutang/piutang masing-masing. Saldo bersih
              tiap orang dihitung otomatis. Murni catatan — tidak memengaruhi saldo maupun budget kamu.
            </p>
          </div>
        </Card>
        </StaggerItem>

        {/* Ringkasan total lintas orang */}
        {(totals.lending > 0 || totals.borrowing > 0) && (
          <StaggerItem>
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-green-700/70 dark:text-green-400/70">
                  Piutang (ke kamu)
                </p>
                <p className="text-base font-bold text-green-600 dark:text-green-400 mt-0.5">
                  {formatRupiah(totals.lending)}
                </p>
              </div>
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600/70 dark:text-red-400/70">
                  Hutang (kamu ngutang)
                </p>
                <p className="text-base font-bold text-red-500 dark:text-red-400 mt-0.5">
                  {formatRupiah(totals.borrowing)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Saldo bersih</span>
              <span className={`text-base font-bold ${
                totalNet > 0 ? 'text-green-600 dark:text-green-400'
                : totalNet < 0 ? 'text-red-500 dark:text-red-400'
                : 'text-slate-400 dark:text-slate-500'
              }`}>
                {totalNet === 0 ? 'Lunas' : `${totalNet > 0 ? '+' : '-'}${formatRupiah(Math.abs(totalNet))}`}
              </span>
            </div>
          </Card>
          </StaggerItem>
        )}

        {/* List orang */}
        <StaggerItem className="flex flex-col gap-2">
          {list.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400 dark:text-slate-500">Belum ada orang.</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                Tap tombol + untuk menambah orang.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
            {sortedList.map(person => {
              const items = person.items ?? []
              const net = netBalance(items)
              const isOpen = expanded.has(person.id)
              const settledCount = items.filter(it => it.settled).length
              // Belum lunas di atas (terbaru dulu), lunas dikumpulkan di bawah.
              const sorted = [...items].sort((a, b) => {
                if (!!a.settled !== !!b.settled) return a.settled ? 1 : -1
                return new Date(b.createdAt) - new Date(a.createdAt)
              })
              return (
                <M.div
                  key={person.id}
                  layout
                  transition={spring}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                >
                <Card className="overflow-hidden">
                  {/* Header orang — klik untuk expand */}
                  <div className="flex items-center gap-2 p-4">
                    <button
                      onClick={() => toggleExpand(person.id)}
                      className="flex flex-1 items-center gap-3 min-w-0 text-left active:opacity-60 transition-opacity duration-150"
                    >
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{person.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {items.length} catatan{settledCount > 0 && ` · ${settledCount} lunas`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {net === 0 ? (
                          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">Lunas</span>
                        ) : (
                          <span className={`text-sm font-bold ${net > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                            {net > 0 ? '+' : '-'}{formatRupiah(Math.abs(net))}
                          </span>
                        )}
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {net > 0 ? 'ke kamu' : net < 0 ? 'kamu ngutang' : 'saldo'}
                        </p>
                      </div>
                    </button>
                    <div className="flex gap-0.5 shrink-0">
                      <button
                        onClick={() => openEditPerson(person)}
                        className="text-slate-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 active:scale-90 transition-all duration-150 p-1.5"
                        aria-label="Edit orang"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deletePerson(person.id)}
                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 active:scale-90 transition-all duration-150 p-1.5"
                        aria-label="Hapus orang"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Body — daftar hutang orang ini */}
                  <AnimatePresence initial={false}>
                  {isOpen && (
                    <M.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                    <div className="border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-3 flex flex-col gap-2">
                      {sorted.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">
                          Belum ada catatan hutang.
                        </p>
                      ) : (
                        <AnimatePresence mode="popLayout" initial={false}>
                        {sorted.map(item => (
                          <M.div
                            key={item.id}
                            layout
                            transition={spring}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`flex items-start justify-between gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                            item.settled
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/40'
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/60'
                          }`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-sm font-medium break-words ${
                                  item.settled
                                    ? 'text-slate-400 dark:text-slate-500 line-through'
                                    : 'text-slate-800 dark:text-slate-100'
                                }`}>{item.title}</p>
                                {item.settled ? (
                                  <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 size={10} /> Lunas
                                  </span>
                                ) : item.debtType === 'lending' ? (
                                  <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                    Meminjamkan
                                  </span>
                                ) : item.debtType === 'borrowing' ? (
                                  <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                    Meminjam
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(item.createdAt)}</p>
                              <p className={`text-sm font-semibold mt-0.5 ${
                                item.settled
                                  ? 'text-slate-400 dark:text-slate-500 line-through'
                                  : 'text-violet-600 dark:text-violet-400'
                              }`}>{formatRupiah(item.amount)}</p>
                            </div>
                            <div className="flex gap-0.5 shrink-0">
                              <button
                                onClick={() => toggleSettled(person.id, item.id)}
                                className={`active:scale-90 transition-all duration-150 p-1.5 ${
                                  item.settled
                                    ? 'text-emerald-500 dark:text-emerald-400 hover:text-slate-400 dark:hover:text-slate-500'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400'
                                }`}
                                aria-label={item.settled ? 'Batal lunas' : 'Tandai lunas'}
                                title={item.settled ? 'Batal lunas' : 'Tandai lunas'}
                              >
                                {item.settled ? <Undo2 size={14} /> : <CheckCircle2 size={14} />}
                              </button>
                              <button
                                onClick={() => openEditItem(person.id, item)}
                                className="text-slate-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 active:scale-90 transition-all duration-150 p-1.5"
                                aria-label="Edit hutang"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => deleteItem(person.id, item.id)}
                                className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 active:scale-90 transition-all duration-150 p-1.5"
                                aria-label="Hapus hutang"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </M.div>
                        ))}
                        </AnimatePresence>
                      )}
                      <button
                        onClick={() => openAddItem(person.id)}
                        className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 active:scale-[0.98] transition-all duration-150"
                      >
                        <Plus size={16} /> Tambah hutang
                      </button>
                    </div>
                    </M.div>
                  )}
                  </AnimatePresence>
                </Card>
                </M.div>
              )
            })}
            </AnimatePresence>
          )}
        </StaggerItem>
      </Stagger>

      {/* FAB — tambah orang */}
      <button
        onClick={openAddPerson}
        className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-300/50 dark:shadow-violet-900/60 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Tambah orang"
      >
        <UserPlus size={24} strokeWidth={2.3} />
      </button>

      {/* Modal tambah / edit orang */}
      <AnimatePresence>
      {personModal && (
        <M.div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setPersonModal(false)}
        >
          <M.div
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={modalSpring}
            onClick={e => e.stopPropagation()}
          >
            <Card className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-slate-100">
                  {personEditId ? 'Edit Orang' : 'Tambah Orang'}
                </h2>
                <button
                  onClick={() => setPersonModal(false)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                  aria-label="Tutup"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Orang</label>
                <input
                  className={inputCls}
                  type="text"
                  placeholder="Contoh: Julian, Safril"
                  value={personName}
                  onChange={e => setPersonName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && savePerson()}
                  autoFocus
                />
              </div>

              {personError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{personError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setPersonModal(false)} className="flex-1 py-3 flex items-center justify-center gap-1">
                  <X size={16} /> Batal
                </Button>
                <Button onClick={savePerson} className="flex-1 py-3 flex items-center justify-center gap-1">
                  <Check size={16} /> Simpan
                </Button>
              </div>
            </Card>
          </M.div>
        </M.div>
      )}
      </AnimatePresence>

      {/* Modal tambah / edit hutang */}
      <AnimatePresence>
      {itemModal && (
        <M.div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setItemModal(false)}
        >
          <M.div
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={modalSpring}
            onClick={e => e.stopPropagation()}
          >
            <Card className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-slate-100">
                  {itemEditId ? 'Edit Hutang' : 'Tambah Hutang'}
                </h2>
                <button
                  onClick={() => setItemModal(false)}
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
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nominal</label>
                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  onKeyDown={e => e.key === 'Enter' && saveItem()}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Judul / Keterangan</label>
                <input
                  className={inputCls}
                  type="text"
                  placeholder="Contoh: Pinjam buat bensin"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal & Waktu</label>
                <input
                  className={inputCls}
                  type="datetime-local"
                  value={datetime}
                  onChange={e => setDatetime(e.target.value)}
                />
              </div>

              {itemError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{itemError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setItemModal(false)} className="flex-1 py-3 flex items-center justify-center gap-1">
                  <X size={16} /> Batal
                </Button>
                <Button onClick={saveItem} className="flex-1 py-3 flex items-center justify-center gap-1">
                  <Check size={16} /> Simpan
                </Button>
              </div>
            </Card>
          </M.div>
        </M.div>
      )}
      </AnimatePresence>
    </PageWrapper>
  )
}
