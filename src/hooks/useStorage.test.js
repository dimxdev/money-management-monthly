import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useStorage } from './useStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('useStorage', () => {
  it('returns default value when storage is empty', () => {
    const { result } = renderHook(() => useStorage('test-key', { count: 0 }))
    expect(result.current[0]).toEqual({ count: 0 })
  })

  it('persists value to localStorage', async () => {
    const { result } = renderHook(() => useStorage('test-key', null))
    act(() => {
      result.current[1]('hello')
    })
    expect(localStorage.getItem('test-key')).toBe('"hello"')
  })

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify({ count: 5 }))
    const { result } = renderHook(() => useStorage('test-key', { count: 0 }))
    expect(result.current[0]).toEqual({ count: 5 })
  })

  it('returns default if localStorage contains invalid JSON', () => {
    localStorage.setItem('test-key', 'not-json')
    const { result } = renderHook(() => useStorage('test-key', 42))
    expect(result.current[0]).toBe(42)
  })
})
