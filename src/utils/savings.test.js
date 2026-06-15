import { describe, it, expect } from 'vitest'
import { SAVINGS_ID, isSavings, makeSavingsCategory } from './savings'

describe('savings helper', () => {
  it('detects the savings category by id', () => {
    expect(isSavings({ id: SAVINGS_ID })).toBe(true)
    expect(isSavings({ id: 'cat_1' })).toBe(false)
    expect(isSavings(null)).toBe(false)
  })

  it('builds a savings category that absorbs the remainder', () => {
    const cat = makeSavingsCategory(750000)
    expect(cat).toEqual({ id: SAVINGS_ID, name: 'Tabungan', budget: 750000 })
  })

  it('never produces a negative budget', () => {
    expect(makeSavingsCategory(-50000).budget).toBe(0)
    expect(makeSavingsCategory(0).budget).toBe(0)
  })

  it('rounds fractional remainders', () => {
    expect(makeSavingsCategory(1000.6).budget).toBe(1001)
  })
})
