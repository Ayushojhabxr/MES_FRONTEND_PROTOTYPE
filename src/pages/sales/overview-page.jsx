import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Factory,
  IndianRupee,
  PackageCheck,
  Search,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const inr = (value) => `INR ${value.toLocaleString('en-IN')}`

const dateRangeOptions = [
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'sixMonths', label: 'Last 6 months' },
  { key: 'thisYear', label: 'This year' },
  { key: 'custom', label: 'Custom' },
]

const salesByPeriod = {
  day: [
    { so: 'SO-7821', date: '2026-05-10', customer: 'Prime Fragrance', product: '50 ml Classic Perfume Bottle', orderQty: 720, dispatchedQty: 720, pendingQty: 0, saleValue: 66240, costValue: 41760, status: 'Completed', production: 'Packed and dispatched', payment: 'Paid' },
    { so: 'SO-7824', date: '2026-05-10', customer: 'Luxury Scents Co.', product: '100 ml Premium Perfume Bottle', orderQty: 900, dispatchedQty: 420, pendingQty: 480, saleValue: 130500, costValue: 82800, status: 'Pending', production: 'Running on Line 2', payment: 'Pending' },
    { so: 'SO-7827', date: '2026-05-10', customer: 'Nova Aromatics', product: '24 mm Perfume Bottle Cap', orderQty: 6200, dispatchedQty: 820, pendingQty: 5380, saleValue: 111600, costValue: 74400, status: 'Blocked', production: 'PP granule shortage', payment: 'Pending' },
  ],
  week: [
    { so: 'SO-7821', date: '2026-05-06', customer: 'Prime Fragrance', product: '50 ml Classic Perfume Bottle', orderQty: 720, dispatchedQty: 720, pendingQty: 0, saleValue: 66240, costValue: 41760, status: 'Completed', production: 'Closed', payment: 'Paid' },
    { so: 'SO-7824', date: '2026-05-07', customer: 'Luxury Scents Co.', product: '100 ml Premium Perfume Bottle', orderQty: 900, dispatchedQty: 420, pendingQty: 480, saleValue: 130500, costValue: 82800, status: 'Pending', production: 'Running', payment: 'Pending' },
    { so: 'SO-7827', date: '2026-05-08', customer: 'Nova Aromatics', product: '24 mm Perfume Bottle Cap', orderQty: 6200, dispatchedQty: 820, pendingQty: 5380, saleValue: 111600, costValue: 74400, status: 'Blocked', production: 'Material shortage', payment: 'Pending' },
    { so: 'SO-7831', date: '2026-05-09', customer: 'Sigma Scents', product: '30 ml Travel Bottle Body', orderQty: 1300, dispatchedQty: 620, pendingQty: 680, saleValue: 46800, costValue: 31200, status: 'Approved', production: 'Final inspection', payment: 'Pending' },
    { so: 'SO-7835', date: '2026-05-09', customer: 'Prime Fragrance', product: '50 ml Classic Perfume Bottle', orderQty: 690, dispatchedQty: 0, pendingQty: 690, saleValue: 63480, costValue: 40020, status: 'Approved', production: 'Planned', payment: 'Pending' },
  ],
  month: [
    { so: 'SO-7790', date: '2026-05-01', customer: 'Aroma Retail', product: '100 ml Premium Perfume Bottle', orderQty: 2600, dispatchedQty: 2380, pendingQty: 220, saleValue: 377000, costValue: 239200, status: 'Dispatched', production: 'Dispatch balance open', payment: 'Paid' },
    { so: 'SO-7798', date: '2026-05-03', customer: 'Travel Mist', product: '30 ml Travel Bottle Body', orderQty: 5400, dispatchedQty: 4680, pendingQty: 720, saleValue: 194400, costValue: 129600, status: 'Pending', production: 'Packing', payment: 'Pending' },
    { so: 'SO-7815', date: '2026-05-05', customer: 'Nova Aromatics', product: '24 mm Perfume Bottle Cap', orderQty: 11800, dispatchedQty: 5200, pendingQty: 6600, saleValue: 212400, costValue: 141600, status: 'Blocked', production: 'Material shortage', payment: 'Pending' },
    { so: 'SO-7821', date: '2026-05-06', customer: 'Prime Fragrance', product: '50 ml Classic Perfume Bottle', orderQty: 7920, dispatchedQty: 7560, pendingQty: 360, saleValue: 728640, costValue: 459360, status: 'Completed', production: 'Closed', payment: 'Paid' },
    { so: 'SO-7824', date: '2026-05-07', customer: 'Luxury Scents Co.', product: '100 ml Premium Perfume Bottle', orderQty: 1480, dispatchedQty: 420, pendingQty: 1060, saleValue: 214600, costValue: 136160, status: 'Pending', production: 'Running', payment: 'Pending' },
  ],
  year: [
    { so: 'SO-Y-101', date: '2026-Q1', customer: 'Prime Fragrance', product: '50 ml Classic Perfume Bottle', orderQty: 58400, dispatchedQty: 54200, pendingQty: 4200, saleValue: 5372800, costValue: 3387200, status: 'Pending', production: 'Monthly releases', payment: 'Partial' },
    { so: 'SO-Y-118', date: '2026-Q1', customer: 'Luxury Scents Co.', product: '100 ml Premium Perfume Bottle', orderQty: 38600, dispatchedQty: 33120, pendingQty: 5480, saleValue: 5597000, costValue: 3551200, status: 'Pending', production: 'Running', payment: 'Partial' },
    { so: 'SO-Y-124', date: '2026-Q2', customer: 'Nova Aromatics', product: '24 mm Perfume Bottle Cap', orderQty: 144000, dispatchedQty: 101600, pendingQty: 42400, saleValue: 2592000, costValue: 1728000, status: 'Blocked', production: 'Raw material risk', payment: 'Pending' },
    { so: 'SO-Y-133', date: '2026-Q2', customer: 'Sigma Scents', product: '30 ml Travel Bottle Body', orderQty: 86200, dispatchedQty: 76300, pendingQty: 9900, saleValue: 3103200, costValue: 2068800, status: 'Approved', production: 'Healthy', payment: 'Partial' },
  ],
}

const allSalesOrders = [
  ...salesByPeriod.month,
  { so: 'SO-7740', date: '2026-04-04', customer: 'Prime Fragrance', product: '50 ml Classic Perfume Bottle', orderQty: 6400, dispatchedQty: 6100, pendingQty: 300, saleValue: 588800, costValue: 371200, status: 'Completed', production: 'Closed', payment: 'Paid' },
  { so: 'SO-7748', date: '2026-04-12', customer: 'Luxury Scents Co.', product: '100 ml Premium Perfume Bottle', orderQty: 3200, dispatchedQty: 2800, pendingQty: 400, saleValue: 464000, costValue: 294400, status: 'Dispatched', production: 'Dispatch balance open', payment: 'Paid' },
  { so: 'SO-7756', date: '2026-04-21', customer: 'Nova Aromatics', product: '24 mm Perfume Bottle Cap', orderQty: 18600, dispatchedQty: 15400, pendingQty: 3200, saleValue: 334800, costValue: 223200, status: 'Pending', production: 'Moulding release', payment: 'Pending' },
  { so: 'SO-7672', date: '2026-03-07', customer: 'Sigma Scents', product: '30 ml Travel Bottle Body', orderQty: 9200, dispatchedQty: 9200, pendingQty: 0, saleValue: 331200, costValue: 220800, status: 'Completed', production: 'Closed', payment: 'Paid' },
  { so: 'SO-7688', date: '2026-03-19', customer: 'Aroma Retail', product: '100 ml Premium Perfume Bottle', orderQty: 4100, dispatchedQty: 3800, pendingQty: 300, saleValue: 594500, costValue: 377200, status: 'Dispatched', production: 'Closed', payment: 'Paid' },
  { so: 'SO-7591', date: '2026-02-08', customer: 'Travel Mist', product: '30 ml Travel Bottle Body', orderQty: 12800, dispatchedQty: 11900, pendingQty: 900, saleValue: 460800, costValue: 307200, status: 'Pending', production: 'Dispatch waiting', payment: 'Partial' },
  { so: 'SO-7518', date: '2026-01-16', customer: 'Luxury Scents Co.', product: '100 ml Premium Perfume Bottle', orderQty: 7600, dispatchedQty: 7200, pendingQty: 400, saleValue: 1102000, costValue: 699200, status: 'Dispatched', production: 'Closed', payment: 'Paid' },
  { so: 'SO-7425', date: '2025-12-11', customer: 'Prime Fragrance', product: '50 ml Classic Perfume Bottle', orderQty: 10400, dispatchedQty: 10400, pendingQty: 0, saleValue: 956800, costValue: 603200, status: 'Completed', production: 'Closed', payment: 'Paid' },
  { so: 'SO-7331', date: '2025-11-18', customer: 'Nova Aromatics', product: '24 mm Perfume Bottle Cap', orderQty: 22400, dispatchedQty: 21000, pendingQty: 1400, saleValue: 403200, costValue: 268800, status: 'Dispatched', production: 'Closed', payment: 'Paid' },
]

const reportingToday = new Date('2026-05-10T00:00:00')

const dateOnly = (date) => new Date(`${date}T00:00:00`)

const getDateRange = (rangeKey, customFrom, customTo) => {
  if (rangeKey === 'lastMonth') return { from: dateOnly('2026-04-01'), to: dateOnly('2026-04-30') }
  if (rangeKey === 'sixMonths') return { from: dateOnly('2025-12-01'), to: reportingToday }
  if (rangeKey === 'thisYear') return { from: dateOnly('2026-01-01'), to: reportingToday }
  if (rangeKey === 'custom') {
    return {
      from: customFrom ? dateOnly(customFrom) : dateOnly('2026-05-01'),
      to: customTo ? dateOnly(customTo) : reportingToday,
    }
  }
  return { from: dateOnly('2026-05-01'), to: reportingToday }
}

const formatDate = (date) => date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const formatRangeLabel = (rangeKey, from, to) => {
  const option = dateRangeOptions.find((item) => item.key === rangeKey)
  return `${option?.label || 'This month'} (${formatDate(from)} - ${formatDate(to)})`
}

function MetricCard({ label, value, note, icon: Icon, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    blue: 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30',
    green: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
    red: 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30',
  }
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <Icon size={18} className="text-slate-500 dark:text-slate-300" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  )
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null
  const profit = order.saleValue - order.costValue
  const margin = order.saleValue ? Math.round((profit / order.saleValue) * 100) : 0
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{order.so} / Sales order detail</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{order.product}</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 dark:border-slate-700 dark:text-slate-100" aria-label="Close detail">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Order received" value={order.orderQty.toLocaleString('en-IN')} note={order.customer} icon={ShoppingCart} tone="blue" />
            <MetricCard label="Dispatched" value={order.dispatchedQty.toLocaleString('en-IN')} note={`${order.pendingQty.toLocaleString('en-IN')} pending`} icon={Truck} tone="green" />
            <MetricCard label="Profit / loss" value={inr(profit)} note={`${margin}% margin`} icon={profit >= 0 ? ArrowUpRight : ArrowDownRight} tone={profit >= 0 ? 'green' : 'red'} />
            <MetricCard label="Current stage" value={order.status} note={order.production} icon={Factory} tone={order.status === 'Blocked' ? 'red' : 'amber'} />
          </div>
          <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700 dark:text-slate-200">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Where are we?</p>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {order.dispatchedQty.toLocaleString('en-IN')} units dispatched out of {order.orderQty.toLocaleString('en-IN')}. Pending balance is {order.pendingQty.toLocaleString('en-IN')} units. Sales value is {inr(order.saleValue)} against cost {inr(order.costValue)}, giving {inr(profit)} profit/loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SalesOverviewPage() {
  const [rangeKey, setRangeKey] = useState('thisMonth')
  const [customFrom, setCustomFrom] = useState('2026-05-01')
  const [customTo, setCustomTo] = useState('2026-05-10')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const activeRange = useMemo(() => getDateRange(rangeKey, customFrom, customTo), [rangeKey, customFrom, customTo])
  const rows = useMemo(() => {
    const { from, to } = activeRange
    const safeFrom = from <= to ? from : to
    const safeTo = from <= to ? to : from
    return allSalesOrders.filter((row) => {
      const rowDate = dateOnly(row.date)
      return rowDate >= safeFrom && rowDate <= safeTo
    })
  }, [activeRange])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
  }, [query, rows])

  const totals = useMemo(() => {
    const orderQty = rows.reduce((sum, row) => sum + row.orderQty, 0)
    const dispatchedQty = rows.reduce((sum, row) => sum + row.dispatchedQty, 0)
    const pendingQty = rows.reduce((sum, row) => sum + row.pendingQty, 0)
    const saleValue = rows.reduce((sum, row) => sum + row.saleValue, 0)
    const costValue = rows.reduce((sum, row) => sum + row.costValue, 0)
    const blocked = rows.filter((row) => row.status === 'Blocked').length
    return {
      orderQty,
      dispatchedQty,
      pendingQty,
      saleValue,
      costValue,
      profit: saleValue - costValue,
      margin: saleValue ? Math.round(((saleValue - costValue) / saleValue) * 100) : 0,
      orderCount: rows.length,
      blocked,
    }
  }, [rows])

  const dispatchPercent = totals.orderQty ? Math.round((totals.dispatchedQty / totals.orderQty) * 100) : 0
  const periodLabel = formatRangeLabel(rangeKey, activeRange.from <= activeRange.to ? activeRange.from : activeRange.to, activeRange.from <= activeRange.to ? activeRange.to : activeRange.from)

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Home / Sales Overview</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">CEO Sales Tracking</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Track received orders, dispatched quantity, current sales status, profit/loss, and pending quantity.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <select
              value={rangeKey}
              onChange={(event) => setRangeKey(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {dateRangeOptions.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
            {rangeKey === 'custom' && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200">
                  From
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(event) => setCustomFrom(event.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200">
                  To
                  <input
                    type="date"
                    value={customTo}
                    onChange={(event) => setCustomTo(event.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Orders received" value={totals.orderQty.toLocaleString('en-IN')} note={`${totals.orderCount} SO in selected range`} icon={ShoppingCart} tone="blue" />
        <MetricCard label="Dispatched" value={totals.dispatchedQty.toLocaleString('en-IN')} note={`${dispatchPercent}% order fulfilled`} icon={Truck} tone="green" />
        <MetricCard label="Pending qty" value={totals.pendingQty.toLocaleString('en-IN')} note="Need production/dispatch" icon={Factory} tone={totals.pendingQty > 5000 ? 'red' : 'amber'} />
        <MetricCard label="Net sales" value={inr(totals.saleValue)} note="Confirmed order value" icon={IndianRupee} tone="green" />
        <MetricCard label="Profit / loss" value={inr(totals.profit)} note={`${totals.margin}% margin`} icon={totals.profit >= 0 ? ArrowUpRight : ArrowDownRight} tone={totals.profit >= 0 ? 'green' : 'red'} />
        <MetricCard label="Blocked orders" value={totals.blocked} note="CEO attention" icon={BarChart3} tone={totals.blocked ? 'red' : 'slate'} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Where are we?</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {periodLabel}: {totals.orderQty.toLocaleString('en-IN')} units ordered, {totals.dispatchedQty.toLocaleString('en-IN')} dispatched, {totals.pendingQty.toLocaleString('en-IN')} pending. Current profit/loss is {inr(totals.profit)}.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <CalendarDays size={16} /> Range filter active
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(dispatchPercent, 100)}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Dispatch progress</span>
          <span>{dispatchPercent}%</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search SO, customer, product, stage..."
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Sales order</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Order qty</th>
                <th>Dispatched</th>
                <th>Pending</th>
                <th>Sale value</th>
                <th>Profit / loss</th>
                <th>Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const profit = row.saleValue - row.costValue
                return (
                  <tr key={`${rangeKey}-${row.so}`} onClick={() => setSelected(row)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{row.so}</p>
                      <p className="text-xs text-slate-500">{row.date}</p>
                    </td>
                    <td>{row.customer}</td>
                    <td>{row.product}</td>
                    <td>{row.orderQty.toLocaleString('en-IN')}</td>
                    <td>{row.dispatchedQty.toLocaleString('en-IN')}</td>
                    <td className={row.pendingQty > 1000 ? 'font-semibold text-amber-700 dark:text-amber-300' : ''}>{row.pendingQty.toLocaleString('en-IN')}</td>
                    <td>{inr(row.saleValue)}</td>
                    <td className={profit >= 0 ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'font-semibold text-rose-700 dark:text-rose-300'}>{inr(profit)}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={(event) => { event.stopPropagation(); setSelected(row) }} className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-sky-600">View</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
