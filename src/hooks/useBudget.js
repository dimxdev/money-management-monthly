import { useMemo } from 'react'
import { calcBudget } from '../utils/budget'

export function useBudget(month) {
  return useMemo(() => calcBudget(month), [month])
}
