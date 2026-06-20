import { calcBudget } from './budget'
import { formatRupiah } from './currency'
import { formatDate, formatDateTime } from './date'

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function sortedExpenses(month) {
  return [...month.expenses].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  )
}

// ───────────────────────── CSV ─────────────────────────
// Delimiter ';' + BOM → ramah Excel Indonesia. Nominal angka mentah agar bisa dijumlah.
export function exportMonthCSV(month) {
  const { totalSpent, remaining, unallocated, categoryStats } = calcBudget(month)
  const SEP = ','
  const esc = v => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const row = (...cells) => cells.map(esc).join(SEP)
  const catName = Object.fromEntries(month.categories.map(c => [c.id, c.name]))

  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const dibuat = `${formatDate(now.toISOString())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

  const lines = [
    row(`Laporan Keuangan — ${month.name}`),
    row('Money Tracker'),
    row('Dibuat', dibuat),
    '',
    row('RINGKASAN'),
    row('Pemasukan', month.income),
    row('Total Pengeluaran', totalSpent),
    row('Sisa Saldo', remaining),
    row('Belum Dialokasikan', Math.max(0, unallocated)),
    '',
    row('PENGELUARAN PER KATEGORI'),
    row('Kategori', 'Budget', 'Terpakai', 'Sisa', 'Persen'),
    ...categoryStats.map(c => row(c.name, c.budget, c.spent, c.remaining, `${c.percentage}%`)),
    '',
    row('DAFTAR TRANSAKSI'),
    row('Tanggal', 'Waktu', 'Kategori', 'Keterangan', 'Nominal'),
  ]

  const expenses = sortedExpenses(month)
  if (expenses.length === 0) {
    lines.push(row('Belum ada transaksi'))
  } else {
    expenses.forEach(e => {
      const d = new Date(e.createdAt)
      const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
      lines.push(row(date, time, catName[e.categoryId] ?? '-', e.description, e.amount))
    })
  }

  const csv = '﻿' + lines.join('\r\n')
  downloadBlob(csv, `laporan-keuangan-${month.id}.csv`, 'text/csv;charset=utf-8')
}

// ───────────────────────── PDF ─────────────────────────
// jsPDF di-import dinamis → hanya diunduh saat user benar-benar export PDF.
export async function exportMonthPDF(month) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const { totalSpent, remaining, categoryStats } = calcBudget(month)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const M = 40

  const VIOLET = [139, 92, 246]
  const SLATE_DARK = [51, 65, 85]
  const SLATE_MUTED = [148, 163, 184]

  // ── Header band ──
  doc.setFillColor(...VIOLET)
  doc.rect(0, 0, pageW, 96, 'F')

  doc.setTextColor(237, 233, 254)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setCharSpace(2)
  doc.text('MONEY TRACKER', M, 34)
  doc.setCharSpace(0)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text('Laporan Keuangan', M, 62)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(month.name, M, 82)

  doc.setFontSize(8)
  doc.setTextColor(221, 214, 254)
  doc.text(`Dibuat ${formatDate(new Date().toISOString())}`, pageW - M, 34, { align: 'right' })

  // ── Ringkasan (3 kotak) ──
  const gap = 12
  const boxW = (pageW - 2 * M - 2 * gap) / 3
  const boxY = 120
  const boxH = 60
  const boxes = [
    { label: 'PEMASUKAN', value: month.income, fill: [239, 246, 255], color: [37, 99, 235] },
    { label: 'TOTAL PENGELUARAN', value: totalSpent, fill: [245, 243, 255], color: [124, 58, 237] },
    {
      label: 'SISA SALDO',
      value: remaining,
      fill: remaining < 0 ? [254, 242, 242] : [236, 253, 245],
      color: remaining < 0 ? [220, 38, 38] : [5, 150, 105],
    },
  ]
  boxes.forEach((b, i) => {
    const x = M + i * (boxW + gap)
    doc.setFillColor(...b.fill)
    doc.roundedRect(x, boxY, boxW, boxH, 8, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...SLATE_MUTED)
    doc.setCharSpace(0.5)
    doc.text(b.label, x + 12, boxY + 22)
    doc.setCharSpace(0)
    doc.setFontSize(13)
    doc.setTextColor(...b.color)
    doc.text(formatRupiah(b.value), x + 12, boxY + 44)
  })

  // ── Tabel kategori ──
  let cursorY = boxY + boxH + 28
  const sectionTitle = (title, y) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...SLATE_DARK)
    doc.text(title, M, y)
  }

  sectionTitle('Pengeluaran per Kategori', cursorY)
  autoTable(doc, {
    startY: cursorY + 8,
    margin: { left: M, right: M },
    head: [['Kategori', 'Budget', 'Terpakai', 'Sisa', '%']],
    body: categoryStats.map(c => [
      c.name,
      formatRupiah(c.budget),
      formatRupiah(c.spent),
      formatRupiah(c.remaining),
      `${c.percentage}%`,
    ]),
    styles: { fontSize: 9, cellPadding: 6, lineColor: [226, 232, 240], lineWidth: 0.5, textColor: SLATE_DARK },
    headStyles: { fillColor: VIOLET, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
  })

  // ── Tabel transaksi ──
  cursorY = doc.lastAutoTable.finalY + 28
  const catName = Object.fromEntries(month.categories.map(c => [c.id, c.name]))
  const expenses = sortedExpenses(month)
  sectionTitle('Daftar Transaksi', cursorY)
  autoTable(doc, {
    startY: cursorY + 8,
    margin: { left: M, right: M },
    head: [['Tanggal', 'Kategori', 'Keterangan', 'Nominal']],
    body: expenses.length
      ? expenses.map(e => [
          formatDateTime(e.createdAt),
          catName[e.categoryId] ?? '-',
          e.description,
          formatRupiah(e.amount),
        ])
      : [['—', '—', 'Belum ada transaksi', '—']],
    styles: { fontSize: 9, cellPadding: 6, lineColor: [226, 232, 240], lineWidth: 0.5, textColor: SLATE_DARK },
    headStyles: { fillColor: VIOLET, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 90 },
      3: { halign: 'right', cellWidth: 80 },
    },
  })

  // ── Footer tiap halaman ──
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(M, pageH - 34, pageW - M, pageH - 34)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...SLATE_MUTED)
    doc.text('Dibuat dengan Money Tracker', M, pageH - 20)
    doc.text(`Halaman ${i} dari ${pageCount}`, pageW - M, pageH - 20, { align: 'right' })
  }

  doc.save(`laporan-keuangan-${month.id}.pdf`)
}
