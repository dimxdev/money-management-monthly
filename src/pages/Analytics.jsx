import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line,
} from 'recharts'
import {
  PieChart as PieChartIcon, BarChart3, Wallet, LineChart as LineChartIcon,
  Gauge, Flame, CalendarDays, TrendingUp, TrendingDown, Receipt,
} from 'lucide-react'
import { useBudgetContext } from '../context/BudgetContext'
import { useBudget } from '../hooks/useBudget'
import { useDarkMode } from '../hooks/useDarkMode'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SpendingChart } from '../components/dashboard/SpendingChart'
import { formatRupiah } from '../utils/currency'
import { buildTrend, monthStats, buildWeekdayData } from '../utils/analytics'

// Palet warna kategori (selaras dengan tema app)
const PALETTE = [
  '#22d3ee', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#0e7490', '#14b8a6', '#f97316',
]

function formatShort(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`
  if (val >= 1000) return `${Math.round(val / 1000)}k`
  return String(val)
}

function PieTooltip({ active, payload, income, isDark }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const pct = income > 0 ? (d.value / income) * 100 : 0
  return (
    <div className={`pointer-events-none rounded-2xl shadow-2xl border px-4 py-3 w-44 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-violet-100'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: d.color }} />
        <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{d.name}</p>
      </div>
      <p className="text-lg font-black text-violet-500 dark:text-violet-400">{formatRupiah(d.value)}</p>
      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {pct.toFixed(1)}% dari saldo
      </p>
    </div>
  )
}

function BarTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const pct = d.budget > 0 ? Math.round((d.spent / d.budget) * 100) : 0
  return (
    <div className={`pointer-events-none rounded-2xl shadow-2xl border px-4 py-3 w-48 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-violet-100'}`}>
      <p className={`text-xs font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{d.name}</p>
      <div className="flex justify-between text-[11px]">
        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Budget</span>
        <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{formatRupiah(d.budget)}</span>
      </div>
      <div className="flex justify-between text-[11px] mt-0.5">
        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Terpakai</span>
        <span className="font-semibold text-violet-500 dark:text-violet-400">{formatRupiah(d.spent)}</span>
      </div>
      <p className={`text-[11px] mt-1 font-medium ${pct >= 100 ? 'text-red-500 dark:text-red-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {pct}% terpakai
      </p>
    </div>
  )
}

function TrendTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const pct = d.income > 0 ? Math.round((d.spent / d.income) * 100) : 0
  return (
    <div className={`pointer-events-none rounded-2xl shadow-2xl border px-4 py-3 w-44 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-violet-100'}`}>
      <p className={`text-xs font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{d.name}</p>
      <div className="flex justify-between text-[11px]">
        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Saldo</span>
        <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{formatRupiah(d.income)}</span>
      </div>
      <div className="flex justify-between text-[11px] mt-0.5">
        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Terpakai</span>
        <span className="font-semibold text-violet-500 dark:text-violet-400">{formatRupiah(d.spent)}</span>
      </div>
      <p className={`text-[11px] mt-1 font-medium ${pct >= 100 ? 'text-red-500 dark:text-red-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {pct}% dari saldo
      </p>
    </div>
  )
}

function WeekdayTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (d.total === 0) return null
  return (
    <div className={`pointer-events-none rounded-2xl shadow-2xl border px-4 py-3 w-40 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-violet-100'}`}>
      <p className={`text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{d.label}</p>
      <p className="text-lg font-black text-violet-500 dark:text-violet-400">{formatRupiah(d.total)}</p>
      {d.isWeekend && <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>akhir pekan</p>}
    </div>
  )
}

const TONE_CLS = {
  default: 'text-slate-800 dark:text-slate-100',
  violet: 'text-violet-600 dark:text-violet-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  red: 'text-red-500 dark:text-red-400',
}

function InsightCard({ icon: Icon, label, value, sub, tone = 'default' }) {
  return (
    <Card className="p-3 lg:p-4">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">{label}</p>
      </div>
      <p className={`text-sm lg:text-base font-black truncate ${TONE_CLS[tone]}`}>{value}</p>
      {sub && <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">{sub}</p>}
    </Card>
  )
}

const selectCls = 'border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400'

export default function Analytics() {
  const navigate = useNavigate()
  const { isDark } = useDarkMode()
  const { months, activeMonth } = useBudgetContext()

  // Bulan tersedia, terbaru di atas
  const sortedMonths = useMemo(
    () => [...months].sort((a, b) => b.id.localeCompare(a.id)),
    [months]
  )

  // Default: bulan aktif; kalau tidak ada, bulan terbaru yang tersedia
  const [selectedId, setSelectedId] = useState(activeMonth?.id ?? sortedMonths[0]?.id ?? '')
  const selectedMonth = months.find(m => m.id === selectedId) ?? activeMonth ?? sortedMonths[0] ?? null

  const { totalSpent, categoryStats } = useBudget(selectedMonth)

  // Bulan sebelumnya (kronologis) untuk perbandingan insight
  const prevMonth = useMemo(() => {
    if (!selectedMonth) return null
    const chrono = [...months].sort((a, b) => a.id.localeCompare(b.id))
    const idx = chrono.findIndex(m => m.id === selectedMonth.id)
    return idx > 0 ? chrono[idx - 1] : null
  }, [months, selectedMonth])

  const stats = useMemo(() => monthStats(selectedMonth, prevMonth), [selectedMonth, prevMonth])
  const trend = useMemo(() => buildTrend(months), [months])

  const income = selectedMonth?.income ?? 0
  const unused = Math.max(0, income - totalSpent)
  const overspent = totalSpent > income

  const pieData = useMemo(() => {
    const spentCats = categoryStats
      .filter(c => c.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .map((c, i) => ({ name: c.name, value: c.spent, color: PALETTE[i % PALETTE.length] }))
    return [
      ...spentCats,
      ...(unused > 0 ? [{ name: 'Belum Terpakai', value: unused, color: isDark ? '#334155' : '#e2e8f0' }] : []),
    ]
  }, [categoryStats, unused, isDark])

  const barData = useMemo(
    () => categoryStats.map((c, i) => ({
      name: c.name,
      budget: c.budget,
      spent: c.spent,
      color: PALETTE[i % PALETTE.length],
    })),
    [categoryStats]
  )

  const weekdayData = useMemo(() => buildWeekdayData(selectedMonth), [selectedMonth])

  const spentPct = income > 0 ? (totalSpent / income) * 100 : 0
  const unusedPct = income > 0 ? (unused / income) * 100 : 0

  const gridColor = isDark ? '#1e293b' : '#f1f5f9'
  const tickColor = isDark ? '#475569' : '#94a3b8'
  const cursorColor = isDark ? '#102a3a' : '#ecfeff'
  const budgetColor = isDark ? '#334155' : '#cbd5e1'
  const spentColor = isDark ? '#22d3ee' : '#0891b2'

  // Belum ada bulan sama sekali
  if (!selectedMonth) {
    return (
      <PageWrapper title="Analitik">
        <Card className="p-8 flex flex-col items-center gap-3 text-center">
          <PieChartIcon size={40} strokeWidth={1.2} className="text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada bulan untuk dianalisis.</p>
          <Button onClick={() => navigate('/setup')} className="mt-1 px-5 py-2.5">Buat Bulan Baru</Button>
        </Card>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Analitik" wide>
      <div className="flex flex-col gap-4">
        {/* Pemilih bulan */}
        <Card className="p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bulan</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {selectedMonth.name}
              {selectedMonth.id === activeMonth?.id && (
                <span className="text-violet-500 dark:text-violet-400 font-semibold"> · bulan ini</span>
              )}
            </p>
          </div>
          <select
            className={selectCls}
            value={selectedMonth.id}
            onChange={e => setSelectedId(e.target.value)}
          >
            {sortedMonths.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Card>

        {income <= 0 ? (
          <Card className="p-8 flex flex-col items-center gap-3 text-center">
            <Wallet size={40} strokeWidth={1.2} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bulan ini belum punya pemasukan, jadi belum ada analitik penggunaan saldo.
            </p>
          </Card>
        ) : (
          <>
        {/* Ringkasan saldo */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 lg:p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Saldo</p>
            <p className="text-sm lg:text-base font-black text-slate-800 dark:text-slate-100 mt-1 truncate">{formatRupiah(income)}</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Terpakai</p>
            <p className="text-sm lg:text-base font-black text-violet-600 dark:text-violet-400 mt-1 truncate">{formatRupiah(totalSpent)}</p>
            <p className={`text-[11px] font-semibold mt-0.5 ${overspent ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>{spentPct.toFixed(1)}%</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Belum Dipakai</p>
            <p className="text-sm lg:text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">{formatRupiah(unused)}</p>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{unusedPct.toFixed(1)}%</p>
          </Card>
        </div>

        {/* Insight cards — angka penting jadi kalimat */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <InsightCard
              icon={Gauge}
              label="Rata-rata / hari"
              value={formatRupiah(stats.avgDaily)}
              sub={`dari ${stats.elapsed} hari`}
            />
            {stats.projection && (
              <InsightCard
                icon={stats.projection.overIncome > 0 ? TrendingUp : TrendingDown}
                label="Proyeksi bulan ini"
                value={formatRupiah(stats.projection.total)}
                sub={stats.projection.overIncome > 0
                  ? `lebih ${formatRupiah(stats.projection.overIncome)} dari saldo`
                  : `aman, di bawah saldo`}
                tone={stats.projection.overIncome > 0 ? 'red' : 'emerald'}
              />
            )}
            {stats.topCategory && (
              <InsightCard
                icon={Flame}
                label="Paling boros"
                value={stats.topCategory.name}
                sub={`${formatRupiah(stats.topCategory.spent)} · ${stats.topCategory.pct}%`}
                tone="violet"
              />
            )}
            {stats.vsPrev && (
              <InsightCard
                icon={stats.vsPrev.direction === 'up' ? TrendingUp : TrendingDown}
                label="vs bulan lalu"
                value={`${stats.vsPrev.pct > 0 ? '+' : ''}${stats.vsPrev.pct}%`}
                sub={`vs ${stats.vsPrev.prevName}`}
                tone={stats.vsPrev.direction === 'up' ? 'red' : 'emerald'}
              />
            )}
            {stats.busiestWeekday && (
              <InsightCard
                icon={CalendarDays}
                label="Hari paling boros"
                value={stats.busiestWeekday.name}
                sub={formatRupiah(stats.busiestWeekday.total)}
              />
            )}
          </div>
        )}

        {/* Tren bulanan — butuh minimal 2 bulan */}
        {trend.length >= 2 && (
          <Card className="p-4 lg:p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <LineChartIcon size={16} className="text-violet-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Tren Bulanan</h3>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: spentColor }} /> Terpakai
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-[2px] rounded" style={{ background: tickColor }} /> Saldo
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
              Pengeluaran {trend.length} bulan terakhir dibanding saldo tiap bulan.
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: tickColor, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatShort} tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} width={34} />
                <Tooltip content={<TrendTooltip isDark={isDark} />} cursor={{ fill: cursorColor, radius: [4, 4, 0, 0] }} />
                <Bar dataKey="spent" fill={spentColor} radius={[5, 5, 0, 0]} barSize={22}>
                  {trend.map((entry, i) => (
                    <Cell key={i} fillOpacity={entry.id === selectedMonth.id ? 1 : 0.45} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="income" stroke={tickColor} strokeWidth={2} strokeDasharray="4 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Pie chart — penggunaan saldo */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-1">
            <PieChartIcon size={16} className="text-violet-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Penggunaan Saldo</h3>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
            Porsi tiap kategori &amp; sisa yang belum dipakai, dari total saldo.
          </p>

          {overspent && (
            <p className="text-[11px] text-red-500 dark:text-red-400 font-medium mb-2">
              Pengeluaran sudah melebihi saldo ({spentPct.toFixed(0)}%).
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-4 items-center">
            {/* Donut + label tengah */}
            <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={95}
                    paddingAngle={pieData.length > 1 ? 2 : 0}
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<PieTooltip income={income} isDark={isDark} />}
                    wrapperStyle={{ pointerEvents: 'none', zIndex: 30 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Terpakai</span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-100">{Math.round(spentPct)}%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2">
              {pieData.map((d, i) => {
                const pct = (d.value / income) * 100
                return (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-block w-3 h-3 rounded-[4px] shrink-0" style={{ background: d.color }} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatRupiah(d.value)}</span>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Bar chart — budget vs terpakai */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-violet-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Budget vs Terpakai</h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: budgetColor }} /> Budget
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: spentColor }} /> Terpakai
              </span>
            </div>
          </div>

          {barData.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-slate-500 py-10 text-sm">Belum ada kategori</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(barData.length * 54, 120)}>
              <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" tickFormatter={formatShort} tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={76} tick={{ fontSize: 10, fill: tickColor, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip isDark={isDark} />} cursor={{ fill: cursorColor }} />
                <Bar dataKey="budget" fill={budgetColor} radius={[0, 4, 4, 0]} barSize={9} />
                <Bar dataKey="spent" fill={spentColor} radius={[0, 4, 4, 0]} barSize={9} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Transaksi terbesar */}
        {stats && stats.topExpenses.length > 0 && (
          <Card className="p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Receipt size={16} className="text-violet-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Transaksi Terbesar</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {stats.topExpenses.map((e, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50 text-[10px] font-black text-violet-600 dark:text-violet-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">{e.description}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{e.category}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 shrink-0">{formatRupiah(e.amount)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Pola hari dalam seminggu */}
        {weekdayData.some(d => d.total > 0) && (
          <Card className="p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays size={16} className="text-violet-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Pola Hari Belanja</h3>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
              Total pengeluaran per hari dalam seminggu.
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekdayData} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: tickColor, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatShort} tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} width={34} />
                <Tooltip content={<WeekdayTooltip isDark={isDark} />} cursor={{ fill: cursorColor, radius: [4, 4, 0, 0] }} />
                <Bar dataKey="total" radius={[5, 5, 2, 2]}>
                  {weekdayData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isWeekend
                        ? (isDark ? '#3b82f6' : '#2563eb')
                        : spentColor}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: spentColor }} /> Hari kerja
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: isDark ? '#3b82f6' : '#2563eb' }} /> Akhir pekan
              </span>
            </div>
          </Card>
        )}

        {/* Grafik harian (reuse) */}
        <SpendingChart month={selectedMonth} />
          </>
        )}
      </div>
    </PageWrapper>
  )
}
