import { useState } from 'react'
import { createPortal } from 'react-dom'
import { m as M, AnimatePresence } from 'motion/react'
import { Plus, Settings2, Pencil, Trash2, Check, X } from 'lucide-react'
import { useStorage } from '../../hooks/useStorage'
import { useToast } from '../../context/ToastContext'
import { toTitleCase } from '../../utils/text'
import { modalSpring } from '../../utils/motion'
import { Card } from './Card'
import { Button } from './Button'

// Template keterangan, dikelola user & dipisah per kategori.
// Disimpan dengan NAMA kategori (bukan id) karena id kategori digenerate ulang
// tiap bulan baru (lihat BudgetSetup.handleSave) — nama stabil antar bulan.
const STORAGE_KEY = 'money-tracker-desc-templates'

const chipBase = 'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95'
const inputCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:placeholder:text-slate-600'

const sameText = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase()

export function DescriptionTemplates({ categoryName, value = '', onSelect }) {
  const [templates, setTemplates] = useStorage(STORAGE_KEY, [])
  const toast = useToast()

  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState('')

  const list = Array.isArray(templates) ? templates : []
  const mine = categoryName
    ? list.filter(t => (t.category ?? '').toLowerCase() === categoryName.toLowerCase())
    : []

  // Chip "+ Simpan" hanya saat ada teks baru yang belum jadi template
  const typed = value.trim()
  const canQuickSave = !!categoryName && !!typed && !mine.some(t => sameText(t.text, typed))

  function addTemplate(text) {
    const clean = toTitleCase(text)
    if (!clean.trim()) return false
    if (mine.some(t => sameText(t.text, clean))) {
      toast?.showToast('Template itu sudah ada di kategori ini.', 'error')
      return false
    }
    setTemplates(prev => [
      ...(Array.isArray(prev) ? prev : []),
      {
        id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text: clean,
        category: categoryName,
      },
    ])
    toast?.showToast('Template disimpan', 'success')
    return true
  }

  function saveDraft() {
    const clean = toTitleCase(draft)
    if (!clean.trim()) return

    if (editId) {
      const original = mine.find(t => t.id === editId)
      // Tidak ada perubahan → tutup form tanpa toast
      if (original && original.text === clean) {
        setEditId(null)
        setDraft('')
        return
      }
      if (mine.some(t => t.id !== editId && sameText(t.text, clean))) {
        return toast?.showToast('Template itu sudah ada di kategori ini.', 'error')
      }
      setTemplates(prev => prev.map(t => (t.id === editId ? { ...t, text: clean } : t)))
      toast?.showToast('Template diperbarui', 'success')
      setEditId(null)
      setDraft('')
      return
    }

    if (addTemplate(clean)) setDraft('')
  }

  function removeTemplate(id) {
    setTemplates(prev => prev.filter(t => t.id !== id))
    if (editId === id) {
      setEditId(null)
      setDraft('')
    }
    toast?.showToast('Template dihapus', 'success')
  }

  function closeModal() {
    setModal(false)
    setEditId(null)
    setDraft('')
  }

  if (!categoryName) return null

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mt-1">
        {mine.length === 0 && !canQuickSave && (
          <p className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 py-1.5">
            Belum ada template. Ketik keterangan lalu tap <span className="font-semibold">+ Simpan</span>.
          </p>
        )}

        {mine.map(t => (
          <button
            key={t.id}
            type="button"
            onPointerDown={e => e.preventDefault()}
            onClick={() => onSelect?.(t.text)}
            className={`${chipBase} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700`}
          >
            {t.text}
          </button>
        ))}

        {canQuickSave && (
          <button
            type="button"
            onPointerDown={e => e.preventDefault()}
            onClick={() => addTemplate(typed)}
            className={`${chipBase} flex items-center gap-1 border border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20`}
          >
            <Plus size={12} /> Simpan
          </button>
        )}

        <button
          type="button"
          onPointerDown={e => e.preventDefault()}
          onClick={() => setModal(true)}
          aria-label="Kelola template"
          title="Kelola template"
          className={`${chipBase} flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400 px-2.5`}
        >
          <Settings2 size={14} />
        </button>
      </div>

      {/* Modal kelola template kategori ini.
          Dirender lewat portal ke <body> karena komponen ini berada di dalam Card
          ber-backdrop-blur — backdrop-filter membuat containing block baru sehingga
          `fixed` di dalamnya hanya menutupi Card, bukan seluruh layar. */}
      {createPortal(
        <AnimatePresence>
          {modal && (
          <M.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeModal}
          >
            <M.div
              className="w-full max-w-md"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={modalSpring}
              onClick={e => e.stopPropagation()}
            >
              <Card className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-900 dark:text-slate-100">Kelola Template</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      Kategori {categoryName}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 active:scale-90 transition-all duration-150 p-1"
                    aria-label="Tutup"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {mine.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-3">
                      Belum ada template untuk kategori ini.
                    </p>
                  ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                      {mine.map(t => (
                        <M.div
                          key={t.id}
                          layout
                          transition={modalSpring}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 px-3 py-2"
                        >
                          {editId === t.id ? (
                            <>
                              <input
                                className={inputCls}
                                type="text"
                                value={draft}
                                onChange={e => setDraft(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveDraft()}
                                autoFocus
                              />
                              <button
                                onClick={saveDraft}
                                className="shrink-0 text-emerald-500 hover:text-emerald-600 active:scale-90 transition-all duration-150 p-1.5"
                                aria-label="Simpan"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => { setEditId(null); setDraft('') }}
                                className="shrink-0 text-slate-300 dark:text-slate-600 hover:text-slate-500 active:scale-90 transition-all duration-150 p-1.5"
                                aria-label="Batal"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="flex-1 min-w-0 text-sm text-slate-800 dark:text-slate-100 truncate">
                                {t.text}
                              </p>
                              <button
                                onClick={() => { setEditId(t.id); setDraft(t.text) }}
                                className="shrink-0 text-slate-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 active:scale-90 transition-all duration-150 p-1.5"
                                aria-label="Edit template"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => removeTemplate(t.id)}
                                className="shrink-0 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 active:scale-90 transition-all duration-150 p-1.5"
                                aria-label="Hapus template"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </M.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {/* Tambah template baru */}
                {!editId && (
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      type="text"
                      placeholder="Template Baru (Ex: Ayam..)"
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveDraft()}
                    />
                    <Button
                      onClick={saveDraft}
                      disabled={!draft.trim()}
                      className="shrink-0 px-4 py-2 text-sm flex items-center gap-1"
                    >
                      <Plus size={15} /> Tambah
                    </Button>
                  </div>
                )}
              </Card>
            </M.div>
          </M.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
