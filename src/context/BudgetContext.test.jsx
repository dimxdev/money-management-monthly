import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BudgetProvider, useBudgetContext } from './BudgetContext'

beforeEach(() => {
  localStorage.clear()
})

const wrapper = ({ children }) => <BudgetProvider>{children}</BudgetProvider>

describe('BudgetContext', () => {
  it('starts with empty months and null activeMonth', () => {
    const { result } = renderHook(() => useBudgetContext(), { wrapper })
    expect(result.current.months).toEqual([])
    expect(result.current.activeMonth).toBeNull()
  })

  it('addMonth creates a month with categories', () => {
    const { result } = renderHook(() => useBudgetContext(), { wrapper })
    act(() => {
      result.current.addMonth('Juni 2026', 5000000, [
        { name: 'Makan', budget: 1500000 },
      ])
    })
    expect(result.current.months).toHaveLength(1)
    expect(result.current.months[0].name).toBe('Juni 2026')
    expect(result.current.months[0].income).toBe(5000000)
    expect(result.current.months[0].categories).toHaveLength(1)
    expect(result.current.months[0].categories[0].name).toBe('Makan')
  })

  it('addExpense appends expense with auto createdAt', () => {
    const { result } = renderHook(() => useBudgetContext(), { wrapper })
    act(() => {
      result.current.addMonth('Juni 2026', 5000000, [{ name: 'Makan', budget: 1500000 }])
    })
    const monthId = result.current.months[0].id
    const catId = result.current.months[0].categories[0].id
    act(() => {
      result.current.addExpense(monthId, { categoryId: catId, amount: 25000, description: 'Ayam Geprek' })
    })
    expect(result.current.months[0].expenses).toHaveLength(1)
    expect(result.current.months[0].expenses[0].amount).toBe(25000)
    expect(result.current.months[0].expenses[0].createdAt).toBeDefined()
  })

  it('editExpense updates the correct expense', () => {
    const { result } = renderHook(() => useBudgetContext(), { wrapper })
    act(() => {
      result.current.addMonth('Juni 2026', 5000000, [{ name: 'Makan', budget: 1500000 }])
    })
    const monthId = result.current.months[0].id
    const catId = result.current.months[0].categories[0].id
    act(() => {
      result.current.addExpense(monthId, { categoryId: catId, amount: 25000, description: 'Ayam Geprek' })
    })
    const expId = result.current.months[0].expenses[0].id
    act(() => {
      result.current.editExpense(monthId, expId, { amount: 30000, description: 'Ayam Bakar' })
    })
    expect(result.current.months[0].expenses[0].amount).toBe(30000)
    expect(result.current.months[0].expenses[0].description).toBe('Ayam Bakar')
  })

  it('deleteExpense removes the expense', () => {
    const { result } = renderHook(() => useBudgetContext(), { wrapper })
    act(() => {
      result.current.addMonth('Juni 2026', 5000000, [{ name: 'Makan', budget: 1500000 }])
    })
    const monthId = result.current.months[0].id
    const catId = result.current.months[0].categories[0].id
    act(() => {
      result.current.addExpense(monthId, { categoryId: catId, amount: 25000, description: 'Ayam Geprek' })
    })
    const expId = result.current.months[0].expenses[0].id
    act(() => {
      result.current.deleteExpense(monthId, expId)
    })
    expect(result.current.months[0].expenses).toHaveLength(0)
  })

  it('addIncome to an existing category bumps income and that category budget', () => {
    const { result } = renderHook(() => useBudgetContext(), { wrapper })
    act(() => {
      result.current.addMonth('Juni 2026', 5000000, [{ name: 'Makan', budget: 1500000 }], '2026-06')
    })
    const catId = result.current.months[0].categories[0].id
    act(() => {
      result.current.addIncome('2026-06', 1000000, { type: 'existing', categoryId: catId })
    })
    const m = result.current.months[0]
    expect(m.income).toBe(6000000)
    expect(m.categories.find(c => c.id === catId).budget).toBe(2500000)
  })

  it('addIncome with a new category appends it with the income as budget', () => {
    const { result } = renderHook(() => useBudgetContext(), { wrapper })
    act(() => {
      result.current.addMonth('Juni 2026', 5000000, [{ name: 'Makan', budget: 1500000 }], '2026-06')
    })
    act(() => {
      result.current.addIncome('2026-06', 800000, { type: 'new', name: 'Investasi' })
    })
    const m = result.current.months[0]
    expect(m.income).toBe(5800000)
    const newCat = m.categories.find(c => c.name === 'Investasi')
    expect(newCat).toBeDefined()
    expect(newCat.budget).toBe(800000)
  })

  it('importData replaces matching months and adds new ones, keeping the rest', () => {
    const { result } = renderHook(() => useBudgetContext(), { wrapper })
    act(() => {
      result.current.addMonth('Mei 2026', 4000000, [{ name: 'Makan', budget: 1000000 }], '2026-05')
      result.current.addMonth('Juni 2026', 5000000, [{ name: 'Makan', budget: 1500000 }], '2026-06')
    })

    act(() => {
      result.current.importData({
        months: [
          // Replace bulan yang sudah ada (Juni)
          { id: '2026-06', name: 'Juni 2026', income: 9999999, categories: [], expenses: [] },
          // Tambah bulan baru (Juli)
          { id: '2026-07', name: 'Juli 2026', income: 6000000, categories: [], expenses: [] },
        ],
      })
    })

    const months = result.current.months
    expect(months).toHaveLength(3) // Mei (kept) + Juni (replaced) + Juli (added)
    expect(months.find(m => m.id === '2026-05').income).toBe(4000000) // Mei tetap aman
    expect(months.find(m => m.id === '2026-06').income).toBe(9999999) // Juni ditimpa
    expect(months.find(m => m.id === '2026-07')).toBeDefined()       // Juli ditambah
  })

  it('clearAllData resets to empty', () => {
    const { result } = renderHook(() => useBudgetContext(), { wrapper })
    act(() => {
      result.current.addMonth('Juni 2026', 5000000, [{ name: 'Makan', budget: 1500000 }])
    })
    act(() => {
      result.current.clearAllData()
    })
    expect(result.current.months).toEqual([])
  })
})
