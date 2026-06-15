import { useMemo } from 'react'

export function useBudget(month) {
  return useMemo(() => {
    if (!month) return { totalSpent: 0, remaining: 0, unallocated: 0, categoryStats: [] }

    const totalBudget = month.categories.reduce((sum, c) => sum + c.budget, 0)
    const unallocated = month.income - totalBudget

    const categoryStats = month.categories.map(cat => {
      const spent = month.expenses
        .filter(e => e.categoryId === cat.id)
        .reduce((sum, e) => sum + e.amount, 0)
      const remaining = cat.budget - spent
      const percentage = cat.budget > 0 ? Math.round((spent / cat.budget) * 100) : 0
      return { ...cat, spent, remaining, percentage }
    })

    const totalSpent = categoryStats.reduce((sum, c) => sum + c.spent, 0)
    const remaining = month.income - totalSpent

    return { totalSpent, remaining, unallocated, categoryStats }
  }, [month])
}
