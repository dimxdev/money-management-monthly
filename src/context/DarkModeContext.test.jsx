import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DarkModeProvider } from './DarkModeContext'
import { ThemeToggle } from '../components/ui/ThemeToggle'

describe('Dark mode toggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to dark and toggles to light on click', () => {
    render(
      <DarkModeProvider>
        <ThemeToggle />
      </DarkModeProvider>
    )

    // Default: dark applied
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    const btn = screen.getByRole('button')
    fireEvent.click(btn)

    // After click: light
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')

    fireEvent.click(btn)
    // Back to dark
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
