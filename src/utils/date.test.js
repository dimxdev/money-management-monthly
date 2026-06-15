import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, getCurrentMonthId, getCurrentMonthName } from './date'

describe('formatDate', () => {
  it('formats ISO date to Indonesian format', () => {
    expect(formatDate('2026-06-14T15:30:00')).toBe('14 Juni 2026')
  })
  it('formats January correctly', () => {
    expect(formatDate('2026-01-01T00:00:00')).toBe('1 Januari 2026')
  })
  it('formats December correctly', () => {
    expect(formatDate('2026-12-31T00:00:00')).toBe('31 Desember 2026')
  })
})

describe('formatDateTime', () => {
  it('contains date and time', () => {
    const result = formatDateTime('2026-06-14T15:30:00')
    expect(result).toContain('14 Juni 2026')
    expect(result).toContain('15:30')
  })
})

describe('getCurrentMonthId', () => {
  it('returns YYYY-MM format', () => {
    const id = getCurrentMonthId()
    expect(id).toMatch(/^\d{4}-\d{2}$/)
  })
})

describe('getCurrentMonthName', () => {
  it('returns Indonesian month name and year', () => {
    const name = getCurrentMonthName()
    expect(name).toMatch(/^[A-Za-z]+ \d{4}$/)
  })
})
