import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useBudget } from './useBudget'

const mockMonth = {
  id: '2026-06',
  name: 'Juni 2026',
  income: 5000000,
  categories: [
    { id: 'cat_1', name: 'Makan', budget: 1500000 },
    { id: 'cat_2', name: 'Transport', budget: 500000 },
  ],
  expenses: [
    { id: 'exp_1', categoryId: 'cat_1', amount: 700000, description: 'Makan', createdAt: '2026-06-01T00:00:00' },
    { id: 'exp_2', categoryId: 'cat_1', amount: 300000, description: 'Makan lagi', createdAt: '2026-06-02T00:00:00' },
  ],
}

describe('useBudget', () => {
  it('returns zeros when month is null', () => {
    const { result } = renderHook(() => useBudget(null))
    expect(result.current.totalSpent).toBe(0)
    expect(result.current.remaining).toBe(0)
    expect(result.current.unallocated).toBe(0)
    expect(result.current.categoryStats).toEqual([])
  })

  it('calculates totalSpent across all categories', () => {
    const { result } = renderHook(() => useBudget(mockMonth))
    expect(result.current.totalSpent).toBe(1000000)
  })

  it('calculates remaining correctly', () => {
    const { result } = renderHook(() => useBudget(mockMonth))
    expect(result.current.remaining).toBe(4000000)
  })

  it('calculates unallocated budget', () => {
    const { result } = renderHook(() => useBudget(mockMonth))
    expect(result.current.unallocated).toBe(3000000)
  })

  it('calculates category stats spent and remaining', () => {
    const { result } = renderHook(() => useBudget(mockMonth))
    const makan = result.current.categoryStats.find(c => c.id === 'cat_1')
    expect(makan.spent).toBe(1000000)
    expect(makan.remaining).toBe(500000)
  })

  it('calculates percentage correctly', () => {
    const { result } = renderHook(() => useBudget(mockMonth))
    const makan = result.current.categoryStats.find(c => c.id === 'cat_1')
    expect(makan.percentage).toBe(67)
  })

  it('calculates percentage above 100 for overspent', () => {
    const overMonth = {
      ...mockMonth,
      expenses: [
        { id: 'exp_1', categoryId: 'cat_1', amount: 2000000, description: 'Overspend', createdAt: '2026-06-01T00:00:00' },
      ],
    }
    const { result } = renderHook(() => useBudget(overMonth))
    const makan = result.current.categoryStats.find(c => c.id === 'cat_1')
    expect(makan.percentage).toBe(133)
  })

  it('returns zero unallocated when budget equals income', () => {
    const fullMonth = {
      ...mockMonth,
      income: 2000000,
      categories: [
        { id: 'cat_1', name: 'Makan', budget: 1500000 },
        { id: 'cat_2', name: 'Transport', budget: 500000 },
      ],
    }
    const { result } = renderHook(() => useBudget(fullMonth))
    expect(result.current.unallocated).toBe(0)
  })
})
