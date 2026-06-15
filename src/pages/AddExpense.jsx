import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBudgetContext } from '../context/BudgetContext'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatRupiah } from '../utils/currency'

const labelCls = 'text-sm font-medium text-slate-700 dark:text-slate-300'
const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600 dark:focus:bg-slate-700'

export default function AddExpense() {
  const { activeMonth, addExpense } = useBudgetContext()
  const navigate = useNavigate()

  const [categoryId, setCategoryId] = useState(activeMonth?.categories[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    setError('')
    if (!categoryId) return setError('Pilih kategori terlebih dahulu.')
    if (!amount || Number(amount) <= 0) return setError('Nominal tidak valid.')
    if (!description.trim()) return setError('Keterangan tidak boleh kosong.')

    addExpense(activeMonth.id, {
      categoryId,
      amount: Number(amount),
      description: description.trim(),
    })
    navigate('/')
  }

  return (
    <PageWrapper title="Catat Pengeluaran">
      <Card className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
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
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Nominal</label>
          <input
            className={`${inputCls} text-xl font-semibold`}
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          {amount && Number(amount) > 0 && (
            <p className="text-sm text-violet-500 dark:text-violet-400 font-medium pl-1">
              {formatRupiah(Number(amount))}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Keterangan</label>
          <input
            className={inputCls}
            type="text"
            placeholder="Contoh: Ayam Geprek"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button onClick={handleSave} className="w-full py-3 text-base">
          Simpan
        </Button>
      </Card>
    </PageWrapper>
  )
}
