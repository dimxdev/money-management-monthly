import { describe, it, expect } from 'vitest'
import { buildTrend, monthStats, buildWeekdayData } from './analytics'
import { SAVINGS_ID } from './savings'

// Helper bikin bulan ringkas
function makeMonth(id, name, income, categories, expenses) {
  return { id, name, income, categories, expenses, incomes: [] }
}

const cats = [
  { id: 'c_makan', name: 'Makan', budget: 1000000 },
  { id: 'c_transport', name: 'Transport', budget: 500000 },
  { id: SAVINGS_ID, name: 'Tabungan', budget: 500000 },
]

describe('buildTrend', () => {
  it('mengurutkan terlama -> terbaru dan menghitung total terpakai', () => {
    const months = [
      makeMonth('2026-05', 'Mei 2026', 2000000, cats, [
        { id: 'e1', categoryId: 'c_makan', amount: 300000, createdAt: '2026-05-02T10:00:00' },
      ]),
      makeMonth('2026-04', 'April 2026', 2000000, cats, []),
    ]
    const trend = buildTrend(months)
    expect(trend.map(t => t.id)).toEqual(['2026-04', '2026-05'])
    expect(trend[0].spent).toBe(0)
    expect(trend[1].spent).toBe(300000)
    expect(trend[1].label).toBe('Mei')
  })

  it('membatasi jumlah bulan ke limit, ambil yang terbaru', () => {
    const months = Array.from({ length: 8 }, (_, i) =>
      makeMonth(`2026-0${i + 1}`, `Bulan ${i + 1}`, 0, [], [])
    )
    const trend = buildTrend(months, 6)
    expect(trend).toHaveLength(6)
    expect(trend[0].id).toBe('2026-03')
  })
})

const juni = makeMonth('2026-06', 'Juni 2026', 3000000, cats, [
  { id: 'e1', categoryId: 'c_makan', amount: 600000, createdAt: '2026-06-06T10:00:00' }, // Sabtu
  { id: 'e2', categoryId: 'c_makan', amount: 200000, createdAt: '2026-06-13T10:00:00' }, // Sabtu
  { id: 'e3', categoryId: 'c_transport', amount: 100000, createdAt: '2026-06-10T10:00:00' }, // Selasa
])

describe('monthStats', () => {
  const now = new Date('2026-06-15T12:00:00')

  it('menghitung rata-rata harian berdasarkan hari berjalan untuk bulan ini', () => {
    const s = monthStats(juni, null, now)
    expect(s.totalSpent).toBe(900000)
    expect(s.elapsed).toBe(15)
    expect(s.avgDaily).toBe(60000) // 900000 / 15
    expect(s.isCurrent).toBe(true)
  })

  it('memproyeksikan total bulan dan selisih terhadap saldo', () => {
    const s = monthStats(juni, null, now)
    expect(s.projection.total).toBe(1800000) // 60000 * 30
    expect(s.projection.overIncome).toBe(-1200000) // di bawah saldo
  })

  it('memilih kategori paling boros, mengabaikan Tabungan', () => {
    const s = monthStats(juni, null, now)
    expect(s.topCategory.name).toBe('Makan')
    expect(s.topCategory.spent).toBe(800000)
    expect(s.topCategory.pct).toBe(89) // 800000 / 900000
  })

  it('menemukan hari paling boros', () => {
    const s = monthStats(juni, null, now)
    expect(s.busiestWeekday.name).toBe('Sabtu')
    expect(s.busiestWeekday.total).toBe(800000)
  })

  it('membandingkan dengan bulan sebelumnya', () => {
    const mei = makeMonth('2026-05', 'Mei 2026', 3000000, cats, [
      { id: 'm1', categoryId: 'c_makan', amount: 600000, createdAt: '2026-05-02T10:00:00' },
    ])
    const s = monthStats(juni, mei, now)
    expect(s.vsPrev.pct).toBe(50) // 900000 vs 600000
    expect(s.vsPrev.direction).toBe('up')
  })

  it('tidak memproyeksikan bulan yang sudah lewat', () => {
    const mei = makeMonth('2026-05', 'Mei 2026', 3000000, cats, [
      { id: 'm1', categoryId: 'c_makan', amount: 600000, createdAt: '2026-05-02T10:00:00' },
    ])
    const s = monthStats(mei, null, now)
    expect(s.projection).toBeNull()
    expect(s.elapsed).toBe(31)
  })

  it('mengurutkan transaksi terbesar', () => {
    const s = monthStats(juni, null, now)
    expect(s.topExpenses[0].amount).toBe(600000)
    expect(s.topExpenses).toHaveLength(3)
  })

  it('mengembalikan null untuk bulan kosong', () => {
    expect(monthStats(null)).toBeNull()
  })
})

describe('buildWeekdayData', () => {
  it('mengembalikan 7 entry, urut Sen → Min', () => {
    const data = buildWeekdayData(juni)
    expect(data).toHaveLength(7)
    expect(data[0].label).toBe('Sen')
    expect(data[6].label).toBe('Min')
  })

  it('menandai weekend', () => {
    const data = buildWeekdayData(juni)
    const sat = data.find(d => d.label === 'Sab')
    const sun = data.find(d => d.label === 'Min')
    const mon = data.find(d => d.label === 'Sen')
    expect(sat.isWeekend).toBe(true)
    expect(sun.isWeekend).toBe(true)
    expect(mon.isWeekend).toBe(false)
  })

  it('mengagregasi pengeluaran per hari dengan benar', () => {
    // juni: e1 + e2 di Sabtu (800000), e3 tanggal 10 Jun = Rabu (100000)
    const data = buildWeekdayData(juni)
    const sat = data.find(d => d.label === 'Sab')
    const wed = data.find(d => d.label === 'Rab')
    expect(sat.total).toBe(800000)
    expect(wed.total).toBe(100000)
  })

  it('mengembalikan array kosong untuk null', () => {
    expect(buildWeekdayData(null)).toEqual([])
  })
})
