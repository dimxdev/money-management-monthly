import { createContext, useContext, useState, useCallback } from 'react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    // Sukses cukup singkat; error tampil lebih lama agar terbaca
    const duration = type === 'success' ? 2500 : 5000
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const successToasts = toasts.filter(t => t.type === 'success')
  const otherToasts = toasts.filter(t => t.type !== 'success')

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast error / info — atas tengah, lebar penuh agar mudah terbaca */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {otherToasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl text-white px-4 py-3 shadow-xl animate-fade-in bg-red-600/80 backdrop-blur-xl backdrop-saturate-150 border border-white/25 shadow-red-900/30"
          >
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Toast sukses — pojok kanan bawah, di atas bottom nav, bentuk kompak */}
      <div className="fixed right-4 bottom-20 lg:bottom-4 z-[100] flex flex-col items-end gap-2 pointer-events-none">
        {successToasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 rounded-2xl text-white px-3.5 py-2.5 shadow-xl animate-pop-in bg-violet-600/80 backdrop-blur-xl backdrop-saturate-150 border border-white/25 shadow-violet-900/30 max-w-[16rem]"
          >
            <CheckCircle2 size={18} className="shrink-0" />
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
