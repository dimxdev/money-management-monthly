import { describe, it, expect } from 'vitest'
import { formatRupiah, parseRupiah } from './currency'

describe('formatRupiah', () => {
  it('formats zero', () => {
    expect(formatRupiah(0)).toBe('Rp0')
  })
  it('formats millions', () => {
    expect(formatRupiah(1500000)).toBe('Rp1.500.000')
  })
  it('formats thousands', () => {
    expect(formatRupiah(25000)).toBe('Rp25.000')
  })
  it('handles string input', () => {
    expect(formatRupiah('5000000')).toBe('Rp5.000.000')
  })
})

describe('parseRupiah', () => {
  it('parses formatted string', () => {
    expect(parseRupiah('Rp1.500.000')).toBe(1500000)
  })
  it('parses plain number string', () => {
    expect(parseRupiah('25000')).toBe(25000)
  })
})
