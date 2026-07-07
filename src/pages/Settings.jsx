import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Upload, Trash2, SlidersHorizontal, MessageCircle, CalendarX2, Heart, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useToast } from '../context/ToastContext'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { exportMonthCSV, exportMonthPDF } from '../utils/export'
import qrisImg from '../assets/qris.png'

const selectCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-3 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400'

export default function Settings() {
  const { months, exportData, exportMonth, importData, clearAllData, deleteMonth } = useBudgetContext()
  const toast = useToast()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  // Bulan tersedia (yang sudah ada datanya), terbaru di atas
  const availableMonths = [...months].sort((a, b) => b.id.localeCompare(a.id))
  const [exportTarget, setExportTarget] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState('')

  // Export laporan (CSV/PDF) — default bulan terbaru
  const [reportTarget, setReportTarget] = useState(availableMonths[0]?.id ?? '')
  const [pdfLoading, setPdfLoading] = useState(false)

  // Modal konfirmasi aktif: { title, message, confirmLabel, onConfirm } | null
  const [confirm, setConfirm] = useState(null)

  const reportMonth = availableMonths.find(m => m.id === reportTarget) ?? null

  function handleExportCSV() {
    if (reportMonth) exportMonthCSV(reportMonth)
  }

  async function handleExportPDF() {
    if (!reportMonth) return
    setPdfLoading(true)
    try {
      await exportMonthPDF(reportMonth)
    } catch {
      toast?.showToast('Gagal membuat PDF. Coba lagi.', 'error')
    } finally {
      setPdfLoading(false)
    }
  }

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
          toast?.showToast('Format file tidak valid. Pastikan menggunakan file backup Money Tracker.')
          return
        }
        const count = parsed.months.length
        const existing = parsed.months.filter(m => months.some(x => x.id === m.id)).length
        const added = count - existing
        setConfirm({
          title: 'Import Data',
          message:
            `File berisi ${count} bulan.\n` +
            `${existing} bulan akan menimpa data yang sudah ada, ${added} bulan baru ditambahkan.\n` +
            `Bulan lain yang tidak ada di file tetap aman.`,
          confirmLabel: 'Import',
          variant: 'primary',
          onConfirm: () => {
            importData(parsed)
            setConfirm(null)
            toast?.showToast('Data berhasil diimport!', 'success')
          },
        })
      } catch {
        toast?.showToast('File tidak valid atau rusak.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleDeleteMonth() {
    if (!deleteTarget) return
    const month = availableMonths.find(m => m.id === deleteTarget)
    if (!month) return
    setConfirm({
      title: `Hapus ${month.name}?`,
      message: 'Data pengeluaran dan kategori bulan ini akan hilang permanen. Tindakan ini tidak bisa dibatalkan.',
      confirmLabel: 'Hapus',
      onConfirm: () => {
        deleteMonth(deleteTarget)
        setDeleteTarget('')
        setConfirm(null)
        toast?.showToast(`Data ${month.name} dihapus`, 'success')
      },
    })
  }

  function handleClear() {
    setConfirm({
      title: 'Hapus SEMUA Data?',
      message: 'Semua data bulan, pengeluaran, dan pemasukan akan hilang permanen. Tindakan ini tidak bisa dibatalkan — pastikan kamu sudah export backup.',
      confirmLabel: 'Hapus Semua',
      onConfirm: () => {
        clearAllData()
        setConfirm(null)
        toast?.showToast('Semua data dihapus', 'success')
      },
    })
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
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Export Laporan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Buat laporan keuangan bulanan yang rapi — CSV untuk diolah di Excel, atau PDF untuk dibaca & dibagikan.
          </p>

          {availableMonths.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">Belum ada data bulan.</p>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Pilih bulan</label>
                <select
                  className={selectCls}
                  value={reportTarget}
                  onChange={e => setReportTarget(e.target.value)}
                >
                  {availableMonths.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.expenses.length} transaksi
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={handleExportCSV}
                  className="w-full py-3 flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet size={18} /> CSV
                </Button>
                <Button
                  variant="primary"
                  onClick={handleExportPDF}
                  disabled={pdfLoading}
                  className="w-full py-3 flex items-center justify-center gap-2"
                >
                  {pdfLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Membuat…</>
                  ) : (
                    <><FileText size={18} /> PDF</>
                  )}
                </Button>
              </div>
            </>
          )}
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
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Hapus Data Bulan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih bulan yang ingin dihapus. Data pengeluaran dan kategori bulan tersebut akan hilang permanen.
          </p>
          {availableMonths.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">Belum ada data bulan.</p>
          ) : (
            <>
              <select
                className={selectCls}
                value={deleteTarget}
                onChange={e => setDeleteTarget(e.target.value)}
              >
                <option value="">-- Pilih bulan --</option>
                {availableMonths.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.expenses.length} transaksi
                  </option>
                ))}
              </select>
              <Button
                variant="danger"
                onClick={handleDeleteMonth}
                disabled={!deleteTarget}
                className="w-full py-3 flex items-center justify-center gap-2"
              >
                <CalendarX2 size={18} /> Hapus Bulan Ini
              </Button>
            </>
          )}
        </Card>

        <Card className="p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Heart size={18} className="text-cyan-500" /> Dukung Developer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aplikasi ini gratis dan tanpa iklan. Kalau terbantu, kamu bisa traktir kopi lewat QRIS di bawah ini.
            Dukungan sekecil apa pun sangat berarti untuk pengembangan selanjutnya. Terima kasih! 🙏
          </p>
          <div className="flex justify-center">
            <img
              src={qrisImg}
              alt="QRIS dukungan developer"
              className="w-full max-w-xs rounded-2xl border border-slate-200 dark:border-slate-600"
            />
          </div>
          <a href={qrisImg} download="qris-dukung-developer.png" className="w-full">
            <Button
              variant="secondary"
              className="w-full py-3 flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download QR
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

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        variant={confirm?.variant ?? 'danger'}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </PageWrapper>
  )
}
