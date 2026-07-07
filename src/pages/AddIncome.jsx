import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useToast } from '../context/ToastContext'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatRupiah } from '../utils/currency'
import { SAVINGS_ID } from '../utils/savings'
import { toTitleCase } from '../utils/text'
import { evalAmount } from '../utils/math'
import { AmountInput } from '../components/ui/AmountInput'

const NEW = '__new__'

const labelCls = 'text-sm font-medium text-slate-700 dark:text-slate-300'
const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600 dark:focus:bg-slate-700'

export default function AddIncome() {
  const { activeMonth, addIncome } = useBudgetContext()
  const toast = useToast()
  const navigate = useNavigate()

  const categories = activeMonth?.categories ?? []
  // Default alokasi ke Tabungan bila ada, kalau tidak ke kategori pertama
  const defaultTarget =
    categories.find(c => c.id === SAVINGS_ID)?.id ?? categories[0]?.id ?? NEW

  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [target, setTarget] = useState(defaultTarget)
  const [newCatName, setNewCatName] = useState('')
  const [error, setError] = useState('')

  const amountNum = evalAmount(amount) || 0
  const targetCat = categories.find(c => c.id === target)

  function handleSave() {
    setError('')
    if (!amountNum || amountNum <= 0) return setError('Nominal pemasukan tidak valid.')

    const desc = toTitleCase(source)
    if (target === NEW) {
      if (!newCatName.trim()) return setError('Nama kategori baru harus diisi.')
      addIncome(activeMonth.id, amountNum, { type: 'new', name: toTitleCase(newCatName) }, desc)
    } else {
      addIncome(activeMonth.id, amountNum, { type: 'existing', categoryId: target }, desc)
    }
    toast?.showToast(`Pemasukan ${formatRupiah(amountNum)} ditambahkan`, 'success')
    navigate('/')
  }

  return (
    <PageWrapper title="Tambah Pemasukan" backTo="/">
      <Card className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Nominal Pemasukan</label>
          <AmountInput value={amount} onChange={setAmount} previewColor="emerald" previewPrefix="+ " />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Sumber <span className="font-normal text-slate-400 dark:text-slate-500">(opsional)</span></label>
          <input
            className={inputCls}
            type="text"
            placeholder="Contoh: Gaji, Bonus, THR"
            value={source}
            onChange={e => setSource(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Alokasikan ke</label>
          <select
            className={inputCls}
            value={target}
            onChange={e => setTarget(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            <option value={NEW}>+ Buat kategori baru…</option>
          </select>
        </div>

        {target === NEW && (
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Nama Kategori Baru</label>
            <input
              className={inputCls}
              type="text"
              placeholder="Contoh: Investasi"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>
        )}

        {/* Ringkasan hasil alokasi */}
        {amountNum > 0 && (
          <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 px-4 py-3">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {target === NEW ? (
                <>Kategori baru <span className="font-bold text-slate-800 dark:text-slate-200">{newCatName.trim() || '…'}</span> akan dibuat dengan budget <span className="font-bold text-violet-600 dark:text-violet-400">{formatRupiah(amountNum)}</span>.</>
              ) : (
                <>Budget <span className="font-bold text-slate-800 dark:text-slate-200">{targetCat?.name}</span> bertambah dari {formatRupiah(targetCat?.budget ?? 0)} menjadi <span className="font-bold text-violet-600 dark:text-violet-400">{formatRupiah((targetCat?.budget ?? 0) + amountNum)}</span>.</>
              )}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button
          variant="secondary"
          onClick={handleSave}
          className="w-full py-3 text-base flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Tambah Pemasukan
        </Button>
      </Card>
    </PageWrapper>
  )
}
