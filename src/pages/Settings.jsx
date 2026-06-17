import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Upload, Trash2, SlidersHorizontal, MessageCircle } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const selectCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-3 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400'

export default function Settings() {
  const { months, exportData, exportMonth, importData, clearAllData } = useBudgetContext()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  // Bulan tersedia (yang sudah ada datanya), terbaru di atas
  const availableMonths = [...months].sort((a, b) => b.id.localeCompare(a.id))
  const [exportTarget, setExportTarget] = useState('all')

  function handleExport() {
    if (exportTarget === 'all') exportData()
    else exportMonth(exportTarget)
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (!parsed.months || !Array.isArray(parsed.months)) {
          alert('Format file tidak valid. Pastikan menggunakan file backup Money Tracker.')
          return
        }
        const count = parsed.months.length
        const existing = parsed.months.filter(m => months.some(x => x.id === m.id)).length
        const added = count - existing
        const msg =
          `File berisi ${count} bulan.\n` +
          `${existing} bulan akan menimpa data yang sudah ada, ${added} bulan baru ditambahkan.\n` +
          `Bulan lain yang tidak ada di file tetap aman.\n\nLanjutkan?`
        if (window.confirm(msg)) {
          importData(parsed)
          alert('Data berhasil diimport!')
        }
      } catch {
        alert('File tidak valid atau rusak.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleClear() {
    if (window.confirm('Hapus SEMUA data? Tindakan ini tidak bisa dibatalkan.')) {
      if (window.confirm('Yakin? Semua data bulan dan pengeluaran akan hilang permanen.')) {
        clearAllData()
      }
    }
  }

  return (
    <PageWrapper title="Pengaturan">
      <div className="flex flex-col gap-4">

        <Card className="p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Budget & Kategori</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Atur ulang pemasukan, tambah atau hapus kategori budget untuk bulan mana saja.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/setup')}
            className="w-full py-3 flex items-center justify-center gap-2"
          >
            <SlidersHorizontal size={18} /> Edit Budget & Kategori
          </Button>
        </Card>

        <Card className="p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Backup Data</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Data disimpan di browser ini. Export secara rutin agar tidak hilang jika browser di-clear.
          </p>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Pilih data yang diexport</label>
            <select
              className={selectCls}
              value={exportTarget}
              onChange={e => setExportTarget(e.target.value)}
            >
              <option value="all">Semua bulan ({availableMonths.length})</option>
              {availableMonths.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.expenses.length} transaksi
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={availableMonths.length === 0}
            className="w-full py-3 flex items-center justify-center gap-2"
          >
            <Download size={18} /> Export JSON
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 flex items-center justify-center gap-2"
          >
            <Upload size={18} /> Import JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </Card>

        <Card className="p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Bantuan & Masukan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Menemukan bug atau punya saran fitur? Jangan ragu untuk menghubungi lewat WhatsApp.
          </p>
          <a
            href="https://wa.me/6281212834013"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="primary"
              className="w-full py-3 flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} /> Chat via WhatsApp
            </Button>
          </a>
        </Card>

        <Card className="p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Menghapus semua data secara permanen. Tidak bisa dibatalkan.
          </p>
          <Button
            variant="danger"
            onClick={handleClear}
            className="w-full py-3 flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Hapus Semua Data
          </Button>
        </Card>
      </div>
    </PageWrapper>
  )
}
