import { useRef } from 'react'
import { evalAmount } from '../../utils/math'
import { formatRupiah } from '../../utils/currency'

const defaultInputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xl font-semibold tracking-wide text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600 dark:focus:bg-slate-700'

export function AmountInput({
  value,
  onChange,
  placeholder = '0',
  inputClassName,
  previewPrefix = '',
  previewColor = 'violet',
  onKeyDown,
  autoFocus,
}) {
  const inputRef = useRef(null)
  const ev = evalAmount(value)
  const hasOp = /[+\-*/]/.test(String(value).slice(1))

  function appendOp(op) {
    const v = String(value).trimEnd()
    if (!v) return
    if (/[+\-*/]$/.test(v)) onChange(v.slice(0, -1).trimEnd() + ` ${op} `)
    else onChange(v + ` ${op} `)
    inputRef.current?.focus()
  }

  const previewCls = previewColor === 'emerald'
    ? 'text-sm font-medium pl-1 text-emerald-500 dark:text-emerald-400'
    : 'text-sm font-medium pl-1 text-violet-500 dark:text-violet-400'

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        className={inputClassName ?? defaultInputCls}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={e => { if (/^[0-9+\-*/\s]*$/.test(e.target.value)) onChange(e.target.value) }}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
      />
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: '+', op: '+', hover: 'hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400' },
          { label: '−', op: '-', hover: 'hover:border-red-400 hover:text-red-500 dark:hover:border-red-600 dark:hover:text-red-400' },
          { label: '×', op: '*', hover: 'hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400' },
          { label: '÷', op: '/', hover: 'hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400' },
        ].map(({ label, op, hover }) => (
          <button
            key={op}
            type="button"
            onPointerDown={e => e.preventDefault()}
            onClick={() => appendOp(op)}
            className={`py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-500 dark:text-slate-400 active:scale-95 transition-all ${hover}`}
          >
            {label}
          </button>
        ))}
      </div>
      {!isNaN(ev) && ev > 0 && (
        <p className={previewCls}>
          {hasOp ? '= ' : ''}{previewPrefix}{formatRupiah(ev)}
        </p>
      )}
    </div>
  )
}
