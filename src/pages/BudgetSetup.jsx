import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { m as M, AnimatePresence } from 'motion/react'
import { Plus, Trash2, PiggyBank, Wallet, Copy } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useToast } from '../context/ToastContext'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { formatRupiah } from '../utils/currency'
import { SAVINGS_ID, makeSavingsCategory, isSavings } from '../utils/savings'
import { toTitleCase } from '../utils/text'
import { evalAmount } from '../utils/math'
import { spring } from '../utils/motion'
import { AmountInput } from '../components/ui/AmountInput'

// Key lokal stabil untuk baris kategori baru (belum punya id) — dibutuhkan layout animation
const makeRowKey = () => `row_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function buildYears() {
  const y = new Date().getFullYear()
  return [y - 1, y, y + 1]
}

// Hanya kategori non-tabungan yang masuk ke daftar editable.
function initFromMonth(month) {
  if (!month) return { income: '', categories: [{ name: '', budget: '' }] }
  return {
    income: month.income.toString(),
    categories: month.categories
      .filter(c => !isSavings(c))
      .map(c => ({ id: c.id, name: c.name, budget: c.budget.toString() })),
  }
}

const selectCls = 'border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-3 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm'
const inlineCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600'

export default function BudgetSetup() {
  const { months, updateMonth, addMonth } = useBudgetContext()
  const toast = useToast()
  const navigate = useNavigate()

  const now = new Date()
  const years = buildYears()

  const activeMonth = months.find(m => m.id === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`) ?? null
  const initMonthNum = activeMonth ? parseInt(activeMonth.id.split('-')[1]) : now.getMonth() + 1
  const initYear    = activeMonth ? parseInt(activeMonth.id.split('-')[0]) : now.getFullYear()

  const [monthNum, setMonthNum] = useState(initMonthNum)
  const [year, setYear]         = useState(initYear)

  const monthId   = `${year}-${String(monthNum).padStart(2, '0')}`
  const monthName = `${MONTH_NAMES[monthNum - 1]} ${year}`

  const existingMonth = months.find(m => m.id === monthId) ?? null
  const isEditing     = !!existingMonth

  // Bulan sebelumnya (relatif ke bulan yang sedang dibuat) untuk carry-over saldo
  const prevMonth = [...months]
    .filter(m => m.id < monthId)
    .sort((a, b) => b.id.localeCompare(a.id))[0] ?? null
  const prevRemaining = prevMonth
    ? prevMonth.income - prevMonth.expenses.reduce((s, e) => s + e.amount, 0)
    : 0

  const init = initFromMonth(existingMonth ?? activeMonth)
  // Bulan baru: sisa saldo bulan lalu otomatis jadi pemasukan awal, tinggal ditambah pemasukan baru
  const initialIncome = !isEditing && prevRemaining > 0 ? prevRemaining.toString() : init.income
  const [income, setIncome]         = useState(initialIncome)
  const [categories, setCategories] = useState(init.categories)
  const [error, setError]           = useState('')
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    const m = months.find(m => m.id === monthId)
    const fresh = initFromMonth(m ?? null)
    // Bulan baru: prefill pemasukan dengan sisa saldo bulan lalu
    setIncome(!m && prevRemaining > 0 ? prevRemaining.toString() : fresh.income)
    setCategories(fresh.categories)
    setError('')
  }, [monthId]) // eslint-disable-line react-hooks/exhaustive-deps

  const incomeNum   = evalAmount(income) || 0
  const totalBudget = categories.reduce((sum, c) => sum + (evalAmount(c.budget) || 0), 0)
  const savingsBudget = Math.max(0, incomeNum - totalBudget)

  function addCategory() {
    setCategories(prev => [...prev, { name: '', budget: '', _key: makeRowKey() }])
  }

  function updateCategory(index, field, value) {
    setCategories(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  function removeCategory(index) {
    setCategories(prev => prev.filter((_, i) => i !== index))
  }

  // Salin kategori (non-tabungan) + budget dari bulan sebelumnya.
  function copyFromPrev() {
    if (!prevMonth) return
    const hasFilled = categories.some(c => c.name.trim() || String(c.budget).trim())
    if (hasFilled && !window.confirm(
      `Ganti kategori yang sedang diisi dengan kategori dari ${prevMonth.name}?`
    )) return

    const copied = prevMonth.categories
      .filter(c => !isSavings(c))
      .map(c => ({ name: c.name, budget: c.budget.toString(), _key: makeRowKey() }))
    if (copied.length === 0) {
      toast?.showToast(`${prevMonth.name} tidak punya kategori untuk disalin.`, 'error')
      return
    }
    setCategories(copied)
    toast?.showToast(`${copied.length} kategori disalin dari ${prevMonth.name}`, 'success')
  }

  function handleSave() {
    setError('')
    if (!incomeNum || incomeNum <= 0) return setError('Total pemasukan tidak valid.')
    if (categories.some(c => !c.name.trim())) return setError('Semua nama kategori harus diisi.')
    if (totalBudget > incomeNum) return setError('Total budget melebihi total pemasukan.')

    const userCategories = categories.map((c, i) => ({
      id: c.id ?? `cat_${Date.now()}_${i}`,
      name: toTitleCase(c.name),
      budget: evalAmount(c.budget) || 0,
    }))

    // Tabungan selalu ada & otomatis menampung sisa, ditaruh paling akhir.
    const validCategories = [...userCategories, makeSavingsCategory(savingsBudget)]

    if (isEditing) {
      const validIds = new Set(validCategories.map(c => c.id))
      const orphaned = existingMonth.expenses.filter(e => !validIds.has(e.categoryId))
      if (orphaned.length > 0) {
        if (!window.confirm(
          `${orphaned.length} pengeluaran dari kategori yang dihapus akan ikut terhapus. Lanjutkan?`
        )) return
      }
      updateMonth(monthId, {
        name: monthName,
        income: incomeNum,
        categories: validCategories,
        expenses: existingMonth.expenses.filter(e => validIds.has(e.categoryId)),
      })
    } else {
      addMonth(monthName, incomeNum, validCategories, monthId)
    }

    navigate('/')
  }

  return (
    <PageWrapper title={isEditing ? `Edit Budget — ${monthName}` : 'Setup Bulan Baru'}>
      <div className="flex flex-col gap-4">

        <Card className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bulan</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{monthName}</p>
            </div>
            <button
              onClick={() => setShowMonthPicker(v => !v)}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
            >
              {showMonthPicker ? 'Tutup' : 'Ganti bulan'}
            </button>
          </div>
          {showMonthPicker && (
            <div className="flex gap-2">
              <select
                className={`flex-1 ${selectCls}`}
                value={monthNum}
                onChange={e => setMonthNum(Number(e.target.value))}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
              <select
                className={`w-28 ${selectCls}`}
                value={year}
                onChange={e => setYear(Number(e.target.value))}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
          {isEditing && (
            <p className="text-xs text-violet-500 dark:text-violet-400 font-medium">
              ✦ Mengedit bulan yang sudah ada — pengeluaran tetap tersimpan
            </p>
          )}
        </Card>

        {/* Info sisa saldo bulan lalu — hanya saat membuat bulan baru & ada bulan sebelumnya */}
        {prevMonth && !isEditing && prevRemaining > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-950/30 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Wallet size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-snug">
              Sisa saldo bulan lalu ({prevMonth.name}) sebesar{' '}
              <span className="font-bold">{formatRupiah(prevRemaining)}</span>
              {' '}sudah dimasukkan ke <span className="font-bold">Total Pemasukan</span>. Tinggal tambahkan pemasukan baru (mis. <span className="font-mono">+5000000</span>).
            </p>
          </div>
        )}

        <Card className="p-4 flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Pemasukan</label>
            <AmountInput value={income} onChange={setIncome} placeholder="5000000" />
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Kategori Budget</h2>
          {incomeNum > 0 && (
            <span className={`text-xs font-medium ${totalBudget > incomeNum ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
              {formatRupiah(totalBudget)} / {formatRupiah(incomeNum)}
            </span>
          )}
        </div>

        {/* Salin kategori dari bulan sebelumnya — hanya saat membuat bulan baru */}
        {!isEditing && prevMonth && (
          <button
            onClick={copyFromPrev}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl border border-dashed border-violet-300 dark:border-violet-700 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 active:scale-[0.98] transition-all duration-150"
          >
            <Copy size={15} /> Salin kategori dari {prevMonth.name}
          </button>
        )}

        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
          {categories.map((cat, i) => (
            <M.div
              key={cat.id ?? cat._key ?? i}
              layout
              transition={spring}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
            <Card className="p-3 flex gap-2 items-start">
              <div className="flex-1 flex flex-col gap-2">
                <input
                  className={inlineCls}
                  placeholder="Nama kategori (contoh: Makan)"
                  value={cat.name}
                  onChange={e => updateCategory(i, 'name', e.target.value)}
                />
                <AmountInput
                  value={cat.budget}
                  onChange={v => updateCategory(i, 'budget', v)}
                  placeholder="Budget (angka)"
                  inputClassName={`${inlineCls} tracking-wide`}
                  previewColor="violet"
                />
              </div>
              <button
                onClick={() => removeCategory(i)}
                className="text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-400 active:scale-90 transition-all duration-150 p-1 mt-1"
                aria-label="Hapus kategori"
              >
                <Trash2 size={18} />
              </button>
            </Card>
            </M.div>
          ))}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          onClick={addCategory}
          className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-600"
        >
          <Plus size={18} /> Tambah Kategori
        </Button>

        {/* Kategori Tabungan — otomatis, tidak bisa dihapus, menampung sisa */}
        <Card className="p-4 flex items-center gap-3 border-violet-200/70 dark:border-violet-800/50 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 dark:from-violet-950/30 dark:to-indigo-950/20">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40">
            <PiggyBank size={22} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 dark:text-slate-100">Tabungan</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Sisa uang yang belum dialokasikan otomatis masuk ke sini
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-black text-violet-600 dark:text-violet-400">
              {formatRupiah(savingsBudget)}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Otomatis
            </p>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button onClick={handleSave} className="w-full py-3 text-base">
          {isEditing ? 'Simpan Perubahan' : 'Simpan & Mulai'}
        </Button>
      </div>
    </PageWrapper>
  )
}
