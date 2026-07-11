import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { m as M, AnimatePresence } from 'motion/react'
import { ChevronRight, ArrowDownLeft, ArrowUpRight, ArrowDownUp, Receipt, Search, X } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useBudget } from '../hooks/useBudget'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { SummaryCard } from '../components/dashboard/SummaryCard'
import { SpendingChart } from '../components/dashboard/SpendingChart'
import { formatRupiah } from '../utils/currency'
import { formatDateTime } from '../utils/date'
import { spring } from '../utils/motion'
import { Stagger, StaggerItem } from '../components/ui/Stagger'

function HistoryList() {
  const { months } = useBudgetContext()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const sorted = [...months].sort((a, b) => b.id.localeCompare(a.id))

  const q = query.trim().toLowerCase()

  // Pencarian pengeluaran lintas semua bulan (deskripsi atau nama kategori).
  const results = useMemo(() => {
    if (!q) return []
    const out = []
    for (const month of months) {
      const catMap = Object.fromEntries((month.categories ?? []).map(c => [c.id, c.name]))
      for (const e of month.expenses ?? []) {
        const catName = catMap[e.categoryId] ?? '—'
        if (`${e.description ?? ''} ${catName}`.toLowerCase().includes(q)) {
          out.push({ ...e, monthId: month.id, monthName: month.name, catName })
        }
      }
    }
    return out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [q, months])

  const totalFound = results.reduce((s, e) => s + e.amount, 0)

  return (
    <PageWrapper title="Riwayat">
      <Stagger className="flex flex-col gap-3">
        {/* Pencarian pengeluaran lintas bulan */}
        <StaggerItem className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari pengeluaran (semua bulan)…"
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
        </StaggerItem>

        {q ? (
          /* Mode pencarian — hasil lintas bulan */
          results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-300 dark:text-slate-600">
              <Receipt size={32} strokeWidth={1.2} />
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Tidak ada pengeluaran cocok dengan “{query.trim()}”
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                {results.length} transaksi · total {formatRupiah(totalFound)}
              </p>
              <Card className="p-4">
                <div className="flex flex-col divide-y divide-slate-50/80 dark:divide-slate-700/50">
                  <AnimatePresence mode="popLayout" initial={false}>
                  {results.map(e => (
                    <M.button
                      key={`${e.monthId}_${e.id}`}
                      layout
                      transition={spring}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => navigate(`/history/${e.monthId}/category/${e.categoryId}`)}
                      className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 active:bg-slate-100/80 dark:active:bg-slate-700/40 -mx-2 px-2 rounded-xl transition-colors duration-150"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center bg-violet-100 dark:bg-violet-900/40">
                        <ArrowUpRight size={17} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                          {e.description || 'Pengeluaran'}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          {e.catName} · {e.monthName} · {formatDateTime(e.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm font-bold shrink-0 text-slate-700 dark:text-slate-200">
                        {formatRupiah(e.amount)}
                      </p>
                    </M.button>
                  ))}
                  </AnimatePresence>
                </div>
              </Card>
            </>
          )
        ) : (
          /* Mode normal — daftar bulan */
          <>
            {sorted.length === 0 && (
              <p className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm">
                Belum ada data bulan
              </p>
            )}
            {sorted.map(month => {
              const totalSpent = month.expenses.reduce((s, e) => s + e.amount, 0)
              const remaining = month.income - totalSpent
              return (
                <StaggerItem key={month.id}>
                <Card
                  className="p-4 cursor-pointer active:scale-[0.98] hover:shadow-md transition-all duration-200"
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
                </StaggerItem>
              )
            })}
          </>
        )}
      </Stagger>
    </PageWrapper>
  )
}

function TransactionRow({ tx, catName, onClick }) {
  const isIncome = tx.type === 'income'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 py-3 text-left ${
        onClick ? 'cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 active:bg-slate-100/80 dark:active:bg-slate-700/40 active:scale-[0.99] -mx-2 px-2 rounded-xl transition-all duration-150' : 'cursor-default'
      }`}
    >
      <div
        className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${
          isIncome
            ? 'bg-emerald-100 dark:bg-emerald-900/40'
            : 'bg-violet-100 dark:bg-violet-900/40'
        }`}
      >
        {isIncome ? (
          <ArrowDownLeft size={17} className="text-emerald-600 dark:text-emerald-400" />
        ) : (
          <ArrowUpRight size={17} className="text-violet-600 dark:text-violet-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
          {tx.description || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {catName} · {formatDateTime(tx.createdAt)}
        </p>
      </div>
      <p
        className={`text-sm font-bold shrink-0 ${
          isIncome
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        {isIncome ? '+ ' : '− '}
        {formatRupiah(tx.amount)}
      </p>
    </button>
  )
}

function HistoryDetail({ month }) {
  const navigate = useNavigate()
  const { totalSpent, remaining } = useBudget(month)

  const [filterCat, setFilterCat] = useState('all')
  const [oldestFirst, setOldestFirst] = useState(false)
  const [query, setQuery] = useState('')

  const catMap = useMemo(
    () => Object.fromEntries((month.categories ?? []).map(c => [c.id, c.name])),
    [month.categories]
  )

  // Gabungkan pemasukan + pengeluaran jadi satu daftar mutasi.
  const transactions = useMemo(() => {
    const incomes = (month.incomes ?? []).map(i => ({ ...i, type: 'income' }))
    const expenses = (month.expenses ?? []).map(e => ({ ...e, type: 'expense' }))
    return [...incomes, ...expenses]
  }, [month.incomes, month.expenses])

  // Kategori yang benar-benar punya transaksi (untuk chip filter).
  const usedCats = useMemo(() => {
    const ids = new Set(transactions.map(t => t.categoryId))
    return (month.categories ?? []).filter(c => ids.has(c.id))
  }, [transactions, month.categories])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = transactions.filter(t => {
      if (filterCat !== 'all' && t.categoryId !== filterCat) return false
      if (q && !(t.description ?? '').toLowerCase().includes(q)) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt)
      return oldestFirst ? diff : -diff
    })
  }, [transactions, filterCat, oldestFirst, query])

  return (
    <PageWrapper title={month.name} backTo="/history">
      <Stagger className="flex flex-col gap-4">
        <StaggerItem>
          <SummaryCard
            month={month}
            totalSpent={totalSpent}
            remaining={remaining}
            onIncomeClick={() => navigate(`/history/${month.id}/income`)}
          />
        </StaggerItem>
        <StaggerItem>
          <SpendingChart month={month} />
        </StaggerItem>

        <StaggerItem className="flex flex-col gap-3">
          {/* Header + toggle urutan */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Mutasi Transaksi
            </h3>
            <button
              type="button"
              onClick={() => setOldestFirst(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <ArrowDownUp size={14} />
              {oldestFirst ? 'Terlama' : 'Terbaru'}
            </button>
          </div>

          {/* Pencarian deskripsi */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari deskripsi transaksi…"
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

          {/* Chip filter kategori */}
          {usedCats.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {[{ id: 'all', name: 'Semua' }, ...usedCats].map(c => {
                const active = filterCat === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFilterCat(c.id)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                      active
                        ? 'bg-violet-500 text-white shadow-sm shadow-violet-200 dark:shadow-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          )}

          {/* Ringkasan daftar — jumlah transaksi & totalnya (ikut filter/pencarian aktif) */}
          {visible.length > 0 && (() => {
            const totalIn = visible.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const totalOut = visible.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
            return (
              <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                {visible.length} transaksi
                {totalOut > 0 && <> · total <span className="font-semibold text-slate-700 dark:text-slate-200">{formatRupiah(totalOut)}</span></>}
                {totalIn > 0 && <> · masuk <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(totalIn)}</span></>}
              </p>
            )
          })()}

          {/* Daftar transaksi */}
          <Card className="p-4">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300 dark:text-slate-600">
                <Receipt size={32} strokeWidth={1.2} />
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Tidak ada transaksi
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-50/80 dark:divide-slate-700/50">
                <AnimatePresence mode="popLayout" initial={false}>
                {visible.map(tx => (
                  <M.div
                    key={`${tx.type}_${tx.id}`}
                    layout
                    transition={spring}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                  >
                    <TransactionRow
                      tx={tx}
                      catName={catMap[tx.categoryId] ?? '—'}
                      onClick={
                        tx.type === 'expense'
                          ? () => navigate(`/history/${month.id}/category/${tx.categoryId}`)
                          : undefined
                      }
                    />
                  </M.div>
                ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </StaggerItem>
      </Stagger>
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
