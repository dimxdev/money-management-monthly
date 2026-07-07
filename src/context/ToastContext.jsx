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

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map(t => {
          const isSuccess = t.type === 'success'
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl text-white px-4 py-3 shadow-xl animate-fade-in ${
                isSuccess
                  ? 'bg-emerald-600 shadow-emerald-900/30'
                  : 'bg-red-600 shadow-red-900/30'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              )}
              <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
