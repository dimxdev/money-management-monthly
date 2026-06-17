import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

export function useStorage(key, defaultValue) {
  const toast = useToast()

  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        toast?.showToast(
          'Penyimpanan browser penuh! Data terbaru tidak tersimpan. Hapus data bulan lama atau export & import ulang di halaman Pengaturan.',
          'error'
        )
      }
    }
  }, [key, value])

  return [value, setValue]
}
