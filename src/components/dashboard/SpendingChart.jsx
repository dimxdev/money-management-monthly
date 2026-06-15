import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BarChart2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { useDarkMode } from '../../hooks/useDarkMode'
import { formatRupiah } from '../../utils/currency'

function buildDailyData(month) {
  if (!month) return []
  const [year, monthNum] = month.id.split('-').map(Number)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const catMap = Object.fromEntries(month.categories.map(c => [c.id, c]))

  const byDay = {}
  month.expenses.forEach(exp => {
    const day = new Date(exp.createdAt).getDate()
    if (!byDay[day]) byDay[day] = []
    byDay[day].push({ ...exp, cat: catMap[exp.categoryId] })
  })

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const expenses = byDay[day] ?? []
    return {
      day,
      label: String(day),
      total: expenses.reduce((s, e) => s + e.amount, 0),
      expenses,
    }
  })
}

function formatY(val) {
  if (val === 0) return '0'
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`
  if (val >= 1000) return `${Math.round(val / 1000)}k`
  return String(val)
}

function TooltipContent({ active, payload }) {
  const { isDark } = useDarkMode()
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (d.total === 0) return null

  return (
    <div
      className={`rounded-2xl shadow-2xl border p-4 w-56 z-50 ${
        isDark
          ? 'bg-slate-900 border-slate-700'
          : 'bg-white border-violet-100'
      }`}
    >
      <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Tanggal {d.day}
      </p>
      <p className="text-lg font-black text-violet-500 dark:text-violet-400 mb-3">
        {formatRupiah(d.total)}
      </p>

      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-0.5">
        {d.expenses.map((exp, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className={`h-6 w-6 shrink-0 rounded-lg flex items-center justify-center mt-0.5 ${isDark ? 'bg-violet-900/50' : 'bg-violet-100'}`}>
              <span className={`text-[10px] font-black ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                {(exp.cat?.name ?? '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold leading-tight truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {exp.description}
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {exp.cat?.name ?? '—'}
              </p>
            </div>
            <p className={`text-xs font-bold shrink-0 ml-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {formatRupiah(exp.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SpendingChart({ month }) {
  const { isDark } = useDarkMode()
  const data = buildDailyData(month)
  const now = new Date()
  const isCurrentMonth =
    month?.id === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const today = now.getDate()
  const hasAnyExpense = data.some(d => d.total > 0)

  const gridColor   = isDark ? '#1e293b' : '#f1f5f9'
  const tickColor   = isDark ? '#475569' : '#94a3b8'
  const cursorColor = isDark ? '#1e1b3a' : '#f5f3ff'
  const emptyColor  = isDark ? '#1e293b' : '#e2e8f0'
  const barColor    = isDark ? '#7c3aed' : '#a78bfa'
  const todayColor  = '#6d28d9'

  return (
    <Card className="p-4 lg:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Pengeluaran Harian</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Hover / tap bar untuk lihat detail transaksi
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
          {isCurrentMonth && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-violet-700" />
              Hari ini
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className={`inline-block w-2.5 h-2.5 rounded-[3px] ${isDark ? 'bg-violet-700' : 'bg-violet-400'}`} />
            Transaksi
          </span>
        </div>
      </div>

      {!hasAnyExpense ? (
        <div className="h-44 flex flex-col items-center justify-center gap-2">
          <BarChart2 size={36} strokeWidth={1.2} className="text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            Belum ada pengeluaran bulan ini
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1 pb-1">
          <div style={{ minWidth: Math.max(data.length * 20, 280) }}>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data} barSize={12} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: tickColor, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  interval={data.length > 20 ? 4 : 1}
                />
                <YAxis
                  tickFormatter={formatY}
                  tick={{ fontSize: 10, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  width={34}
                />
                <Tooltip
                  content={<TooltipContent />}
                  cursor={{ fill: cursorColor, radius: [4, 4, 0, 0] }}
                />
                <Bar dataKey="total" radius={[5, 5, 2, 2]}>
                  {data.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        isCurrentMonth && entry.day === today
                          ? todayColor
                          : entry.total > 0
                          ? barColor
                          : emptyColor
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  )
}
