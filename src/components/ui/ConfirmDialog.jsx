import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

// Modal konfirmasi pengganti window.confirm — konsisten dengan desain app.
// open: boolean · title/message: teks · variant: 'danger' | 'primary'
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white/75 dark:bg-slate-800/65 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-white/10 rounded-3xl p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.6)] animate-pop-in"
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center ${
              variant === 'danger'
                ? 'bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400'
                : 'bg-violet-100 dark:bg-violet-900/40 text-violet-500 dark:text-violet-400'
            }`}
          >
            <AlertTriangle size={19} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
