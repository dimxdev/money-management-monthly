import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBudgetContext } from '../context/BudgetContext'
import { useToast } from '../context/ToastContext'
import { useBudget } from '../hooks/useBudget'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatRupiah } from '../utils/currency'
import { toTitleCase } from '../utils/text'
import { evalAmount } from '../utils/math'
import { toDatetimeLocal } from '../utils/date'
import { AmountInput } from '../components/ui/AmountInput'
import { Stagger, StaggerItem } from '../components/ui/Stagger'

const labelCls = 'text-sm font-medium text-slate-700 dark:text-slate-300'
const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600 dark:focus:bg-slate-700'

export default function AddExpense() {
  const { activeMonth, addExpense } = useBudgetContext()
  const { categoryStats } = useBudget(activeMonth)
  const toast = useToast()
  const navigate = useNavigate()

  const [categoryId, setCategoryId] = useState(activeMonth?.categories[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [datetime, setDatetime] = useState(toDatetimeLocal())
  const [error, setError] = useState('')

  const selectedStat = categoryStats.find(c => c.id === categoryId)

  const evaluated = evalAmount(amount)

  function handleSave() {
    setError('')
    if (!categoryId) return setError('Pilih kategori terlebih dahulu.')
    if (isNaN(evaluated) || evaluated <= 0) return setError('Nominal tidak valid.')
    if (selectedStat && evaluated > selectedStat.remaining) {
      return setError(
        `Nominal melebihi sisa budget kategori ini (${formatRupiah(selectedStat.remaining)}).`
      )
    }
    if (!description.trim()) return setError('Keterangan tidak boleh kosong.')

    let createdAt
    if (datetime) {
      const d = new Date(datetime)
      if (isNaN(d.getTime())) return setError('Tanggal & waktu tidak valid.')
      createdAt = d.toISOString()
    }

    addExpense(activeMonth.id, {
      categoryId,
      amount: evaluated,
      description: toTitleCase(description),
      ...(createdAt && { createdAt }),
    })
    toast?.showToast(`Pengeluaran ${formatRupiah(evaluated)} tercatat`, 'success')
    navigate('/')
  }

  return (
    <PageWrapper title="Catat Pengeluaran" backTo="/">
      <Stagger>
      <StaggerItem>
      <Card className="p-4 flex flex-col gap-4">
        <StaggerItem className="flex flex-col gap-1">
          <label className={labelCls}>Kategori</label>
          <select
            className={inputCls}
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
          >
            {activeMonth?.categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {selectedStat && (
            <p className="text-sm pl-1">
              <span className="text-slate-400 dark:text-slate-500">Sisa budget: </span>
              <span
                className={`font-semibold ${
                  selectedStat.remaining <= 0
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatRupiah(selectedStat.remaining)}
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                {' '}/ {formatRupiah(selectedStat.budget)}
              </span>
            </p>
          )}
        </StaggerItem>

        <StaggerItem className="flex flex-col gap-1">
          <label className={labelCls}>Nominal</label>
          <AmountInput value={amount} onChange={setAmount} />
        </StaggerItem>

        <StaggerItem className="flex flex-col gap-1">
          <label className={labelCls}>Keterangan</label>
          <input
            className={inputCls}
            type="text"
            placeholder="Contoh: Ayam Geprek"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </StaggerItem>

        <StaggerItem className="flex flex-col gap-1">
          <label className={labelCls}>Tanggal & Waktu</label>
          <input
            className={inputCls}
            type="datetime-local"
            value={datetime}
            onChange={e => setDatetime(e.target.value)}
          />
        </StaggerItem>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <StaggerItem>
          <Button
            onClick={handleSave}
            disabled={!!selectedStat && evaluated > selectedStat.remaining}
            className="w-full py-3 text-base"
          >
            Simpan
          </Button>
        </StaggerItem>
      </Card>
      </StaggerItem>
      </Stagger>
    </PageWrapper>
  )
}
