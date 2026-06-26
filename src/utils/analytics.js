// Analitik turunan — fungsi murni di atas calcBudget, tanpa React.
// Dipakai halaman Analytics untuk tren antar-bulan & insight cards.
import { calcBudget } from './budget'
import { isSavings } from './savings'

const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

// Jumlah hari dalam sebuah bulan dari id "YYYY-MM".
function daysInMonthId(id) {
  const [year, month] = id.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

// Label singkat untuk sumbu chart, mis. "Juni 2026" -> "Jun".
function shortLabel(month) {
  return (month.name?.split(' ')[0] ?? month.id).slice(0, 3)
}

// Tren beberapa bulan terakhir (default 6), urut terlama -> terbaru.
// Tiap titik: { id, name, label, income, spent }.
export function buildTrend(months, limit = 6) {
  return [...months]
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(-limit)
    .map(m => ({
      id: m.id,
      name: m.name,
      label: shortLabel(m),
      income: m.income,
      spent: calcBudget(m).totalSpent,
    }))
}

// Berapa hari yang sudah berjalan di bulan ini (untuk rata-rata harian & proyeksi).
// Bulan berjalan -> tanggal hari ini; bulan lampau -> penuh sebulan.
function elapsedDays(month, now) {
  const currentId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  if (month.id === currentId) return now.getDate()
  return daysInMonthId(month.id)
}

// Agregasi pengeluaran per hari dalam seminggu, urut Sen → Min.
// Tiap entry: { label, total, isWeekend }
export function buildWeekdayData(month) {
  if (!month) return []
  const LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const totals = Array(7).fill(0)
  month.expenses.forEach(e => {
    totals[new Date(e.createdAt).getDay()] += e.amount
  })
  return [1, 2, 3, 4, 5, 6, 0].map(i => ({
    label: LABELS[i],
    total: totals[i],
    isWeekend: i === 0 || i === 6,
  }))
}

// Statistik turunan untuk satu bulan, dipakai untuk insight cards.
// prevMonth opsional (untuk perbandingan bulan sebelumnya).
export function monthStats(month, prevMonth = null, now = new Date()) {
  if (!month) return null

  const { totalSpent, categoryStats } = calcBudget(month)
  const totalDays = daysInMonthId(month.id)
  const elapsed = Math.max(1, elapsedDays(month, now))
  const isCurrent = month.id === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const avgDaily = Math.round(totalSpent / elapsed)

  // Proyeksi total bulan ini berdasarkan laju rata-rata harian — hanya untuk bulan berjalan.
  let projection = null
  if (isCurrent && elapsed < totalDays) {
    const projected = Math.round(avgDaily * totalDays)
    projection = {
      total: projected,
      overIncome: month.income > 0 ? projected - month.income : 0,
    }
  }

  // Kategori paling boros (abaikan Tabungan & yang belum terpakai).
  let topCategory = null
  const spentCats = categoryStats.filter(c => c.spent > 0 && !isSavings(c))
  if (spentCats.length > 0) {
    const top = spentCats.reduce((a, b) => (b.spent > a.spent ? b : a))
    topCategory = {
      name: top.name,
      spent: top.spent,
      pct: totalSpent > 0 ? Math.round((top.spent / totalSpent) * 100) : 0,
    }
  }

  // Hari dalam seminggu dengan total pengeluaran terbesar.
  let busiestWeekday = null
  if (month.expenses.length > 0) {
    const byWeekday = Array(7).fill(0)
    month.expenses.forEach(e => {
      byWeekday[new Date(e.createdAt).getDay()] += e.amount
    })
    let maxIdx = 0
    byWeekday.forEach((v, i) => { if (v > byWeekday[maxIdx]) maxIdx = i })
    if (byWeekday[maxIdx] > 0) {
      busiestWeekday = { name: WEEKDAYS[maxIdx], total: byWeekday[maxIdx] }
    }
  }

  // Perbandingan dengan bulan sebelumnya.
  let vsPrev = null
  if (prevMonth) {
    const prevSpent = calcBudget(prevMonth).totalSpent
    if (prevSpent > 0) {
      const diff = totalSpent - prevSpent
      vsPrev = {
        pct: Math.round((diff / prevSpent) * 100),
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
        prevName: prevMonth.name,
      }
    }
  }

  // Transaksi terbesar.
  const catName = Object.fromEntries(month.categories.map(c => [c.id, c.name]))
  const topExpenses = [...month.expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map(e => ({
      description: e.description || '(tanpa keterangan)',
      amount: e.amount,
      category: catName[e.categoryId] ?? '—',
    }))

  return { totalSpent, avgDaily, elapsed, totalDays, isCurrent, projection, topCategory, busiestWeekday, vsPrev, topExpenses }
}
