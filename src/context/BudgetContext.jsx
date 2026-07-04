import { createContext, useContext, useCallback } from 'react'
import { useStorage } from '../hooks/useStorage'
import { getCurrentMonthId } from '../utils/date'
import { isSavings } from '../utils/savings'

const BudgetContext = createContext(null)

const STORAGE_KEY = 'money-tracker-data'
const DEFAULT_DATA = { months: [] }

export function BudgetProvider({ children }) {
  const [data, setData] = useStorage(STORAGE_KEY, DEFAULT_DATA)

  const activeMonth = data.months.find(m => m.id === getCurrentMonthId()) ?? null

  const addMonth = useCallback((name, income, categories, id = getCurrentMonthId()) => {
    const newMonth = {
      id,
      name,
      income,
      categories: categories.map((c, i) => ({
        ...c,
        id: c.id ?? `cat_${Date.now()}_${i}`,
      })),
      expenses: [],
      incomes: [],
    }
    setData(prev => ({
      months: [...prev.months.filter(m => m.id !== id), newMonth],
    }))
  }, [setData])

  const updateMonth = useCallback((monthId, updates) => {
    setData(prev => ({
      months: prev.months.map(m => m.id === monthId ? { ...m, ...updates } : m),
    }))
  }, [setData])

  // Tambah pemasukan & alokasikan ke kategori (existing atau buat baru).
  // income += amount; budget kategori target += amount (invariant income == total budget tetap terjaga).
  // Tiap pemasukan dicatat ke array `incomes` agar punya riwayat.
  // target: { type: 'existing', categoryId } | { type: 'new', name }
  const addIncome = useCallback((monthId, amount, target, description = '') => {
    setData(prev => ({
      months: prev.months.map(m => {
        if (m.id !== monthId) return m
        const income = m.income + amount

        const record = {
          id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          amount,
          description: description.trim(),
          createdAt: new Date().toISOString(),
        }
        const incomes = [...(m.incomes ?? []), record]

        if (target.type === 'new') {
          const newCat = {
            id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: target.name.trim(),
            budget: amount,
          }
          record.categoryId = newCat.id
          // Sisipkan sebelum kategori Tabungan agar Tabungan tetap paling akhir
          const savingsIdx = m.categories.findIndex(isSavings)
          const categories = savingsIdx === -1
            ? [...m.categories, newCat]
            : [
                ...m.categories.slice(0, savingsIdx),
                newCat,
                ...m.categories.slice(savingsIdx),
              ]
          return { ...m, income, categories, incomes }
        }

        record.categoryId = target.categoryId
        const categories = m.categories.map(c =>
          c.id === target.categoryId ? { ...c, budget: c.budget + amount } : c
        )
        return { ...m, income, categories, incomes }
      }),
    }))
  }, [setData])

  const addExpense = useCallback((monthId, expense) => {
    const newExpense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: expense.createdAt || new Date().toISOString(),
    }
    setData(prev => ({
      months: prev.months.map(m =>
        m.id === monthId ? { ...m, expenses: [...m.expenses, newExpense] } : m
      ),
    }))
  }, [setData])

  const editExpense = useCallback((monthId, expenseId, updates) => {
    setData(prev => ({
      months: prev.months.map(m =>
        m.id === monthId
          ? {
              ...m,
              expenses: m.expenses.map(e =>
                e.id === expenseId ? { ...e, ...updates } : e
              ),
            }
          : m
      ),
    }))
  }, [setData])

  const deleteExpense = useCallback((monthId, expenseId) => {
    setData(prev => ({
      months: prev.months.map(m =>
        m.id === monthId
          ? { ...m, expenses: m.expenses.filter(e => e.id !== expenseId) }
          : m
      ),
    }))
  }, [setData])

  const downloadJSON = useCallback((payload, filename) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const exportData = useCallback(() => {
    downloadJSON(data, `money-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`)
  }, [data, downloadJSON])

  // Export satu bulan saja, tetap dalam format { months: [...] } agar bisa di-import kembali.
  const exportMonth = useCallback((monthId) => {
    const month = data.months.find(m => m.id === monthId)
    if (!month) return
    downloadJSON({ months: [month] }, `money-tracker-${monthId}.json`)
  }, [data, downloadJSON])

  // Merge per-bulan: bulan yang sudah ada di-replace, bulan baru ditambahkan,
  // bulan lain yang tidak ada di file tetap dipertahankan.
  const importData = useCallback((jsonData) => {
    setData(prev => {
      const byId = new Map(prev.months.map(m => [m.id, m]))
      ;(jsonData.months ?? []).forEach(m => byId.set(m.id, m))
      // Urutkan agar konsisten (terlama ke terbaru)
      const months = Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id))
      return { months }
    })
  }, [setData])

  const clearAllData = useCallback(() => {
    setData(DEFAULT_DATA)
  }, [setData])

  const deleteMonth = useCallback((monthId) => {
    setData(prev => ({ months: prev.months.filter(m => m.id !== monthId) }))
  }, [setData])

  return (
    <BudgetContext.Provider value={{
      months: data.months,
      activeMonth,
      addMonth,
      updateMonth,
      addIncome,
      addExpense,
      editExpense,
      deleteExpense,
      exportData,
      exportMonth,
      importData,
      clearAllData,
      deleteMonth,
    }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudgetContext() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudgetContext must be used within BudgetProvider')
  return ctx
}
