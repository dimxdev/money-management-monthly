import { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext(null)

export function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    // Status bar browser/PWA ikut warna background tema, bukan warna brand
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#0B1026' : '#EAF7FA')
  }, [isDark])

  function toggle() {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  return useContext(DarkModeContext)
}
