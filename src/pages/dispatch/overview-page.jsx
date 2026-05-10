import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Boxes,
  ClipboardList,
  Factory,
  IndianRupee,
  PackageCheck,
  Search,
  Truck,
  Warehouse,
  X,
} from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const inr = (value) => `INR ${value.toLocaleString('en-IN')}`

const dispatches = [
  {
    challan: 'DC-9021',
    invoice: 'INV-7721',
    date: '2026-05-10',
    customer: 'Prime Fragrance',
    product: '50 ml Classic Perfume Bottle',
    so: 'SO-7821',
    dispatchedQty: 720,
    fgBefore: 1080,
    fgAfter: 360,
    sellingPrice: 92,
    productCost: 58,
    freightCost: 4200,
    packingCost: 720,
    status: 'Dispatched',
    vehicle: 'MH12 AB 4451',
    destination: 'Mumbai DC',
    recipe: [
      { item: 'Glass bottle body 50 ml', perUnit: '1 pc', used: 720, cost: 24 },
      { item: 'Plastic cap', perUnit: '1 pc', used: 720, cost: 7 },
      { item: 'Spray pump', perUnit: '1 pc', used: 720, cost: 9 },
      { item: 'Neck crimp collar', perUnit: '1 pc', used: 720, cost: 3 },
      { item: 'Printed label', perUnit: '2 pc', used: 1440, cost: 2 },
      { item: 'Retail box', perUnit: '1 pc', used: 720, cost: 1 },
    ],
  },
  {
    challan: 'DC-9024',
    invoice: 'INV-7724',
    date: '2026-05-10',
    customer: 'Luxury Scents Co.',
    product: '100 ml Premium Perfume Bottle',
    so: 'SO-7824',
    dispatchedQty: 420,
    fgBefore: 1160,
    fgAfter: 740,
    sellingPrice: 145,
    productCost: 92,
    freightCost: 5600,
    packingCost: 840,
    status: 'Pending',
    vehicle: 'HR55 CX 2044',
    destination: 'Delhi NCR',
    recipe: [
      { item: 'Glass bottle body 100 ml', perUnit: '1 pc', used: 420, cost: 38 },
      { item: 'Metal cap', perUnit: '1 pc', used: 420, cost: 14 },
      { item: 'Spray pump', perUnit: '1 pc', used: 420, cost: 11 },
      { item: 'Plastic collar', perUnit: '1 pc', used: 420, cost: 5 },
      { item: 'Front + back label', perUnit: '2 pc', used: 840, cost: 3 },
      { item: 'Inner mono carton', perUnit: '1 pc', used: 420, cost: 3 },
    ],
  },
  {
    challan: 'DC-9027',
    invoice: 'INV-7727',
    date: '2026-05-09',
    customer: 'Nova Aromatics',
    product: '24 mm Perfume Bottle Cap',
    so: 'SO-7827',
    dispatchedQty: 820,
    fgBefore: 1280,
    fgAfter: 460,
    sellingPrice: 18,
    productCost: 12,
    freightCost: 2600,
    packingCost: 410,
    status: 'Blocked',
    vehicle: 'GJ01 KT 8872',
    destination: 'Ahmedabad',
    recipe: [
      { item: 'PP granules', perUnit: '18 g', used: 14760, cost: 5 },
      { item: 'Metalized film sleeve', perUnit: '1 pc', used: 820, cost: 2 },
      { item: 'Inner plug insert', perUnit: '1 pc', used: 820, cost: 1 },
      { item: 'Top logo sticker', perUnit: '1 pc', used: 820, cost: 1 },
    ],
  },
  {
    challan: 'DC-9031',
    invoice: 'INV-7731',
    date: '2026-05-09',
    customer: 'Sigma Scents',
    product: '30 ml Travel Bottle Body',
    so: 'SO-7831',
    dispatchedQty: 620,
    fgBefore: 1540,
    fgAfter: 920,
    sellingPrice: 36,
    productCost: 24,
    freightCost: 3100,
    packingCost: 620,
    status: 'Approved',
    vehicle: 'KA03 MX 1190',
    destination: 'Bengaluru',
    recipe: [
      { item: 'Glass tube body 30 ml', perUnit: '1 pc', used: 620, cost: 15 },
      { item: 'Transparent overcap', perUnit: '1 pc', used: 620, cost: 3 },
      { item: 'Pump fitment ring', perUnit: '1 pc', used: 620, cost: 2 },
      { item: 'Barcode label', perUnit: '1 pc', used: 620, cost: 1 },
    ],
  },
]

function getFinancials(row) {
  const salesValue = row.dispatchedQty * row.sellingPrice
  const materialCost = row.recipe.reduce((sum, item) => sum + item.used * item.cost, 0)
  const productionCost = row.dispatchedQty * row.productCost
  const totalCost = productionCost + row.freightCost + row.packingCost
  const netProfit = salesValue - totalCost
  const margin = salesValue ? Math.round((netProfit / salesValue) * 100) : 0
  return { salesValue, materialCost, productionCost, totalCost, netProfit, margin }
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

function DispatchModal({ row, onClose }) {
  if (!row) return null
  const finance = getFinancials(row)
  const stockReduction = row.fgBefore - row.fgAfter

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{row.challan} / {row.invoice} / {row.so}</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{row.product}</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 dark:border-slate-700 dark:text-slate-100" aria-label="Close detail">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Dispatched qty" value={row.dispatchedQty.toLocaleString('en-IN')} note={`${row.customer} / ${row.destination}`} icon={Truck} tone="blue" />
            <MetricCard label="FG stock reduced" value={stockReduction.toLocaleString('en-IN')} note={`${row.fgBefore} to ${row.fgAfter} units`} icon={Warehouse} tone="amber" />
            <MetricCard label="Net sales" value={inr(finance.salesValue)} note={`${inr(row.sellingPrice)} per unit`} icon={IndianRupee} tone="green" />
            <MetricCard label="Net profit" value={inr(finance.netProfit)} note={`${finance.margin}% margin`} icon={ArrowUpRight} tone={finance.netProfit >= 0 ? 'green' : 'red'} />
          </div>

          <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">CEO dispatch summary</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {row.dispatchedQty.toLocaleString('en-IN')} units were dispatched, reducing finished goods stock from {row.fgBefore.toLocaleString('en-IN')} to {row.fgAfter.toLocaleString('en-IN')}. Sales value is {inr(finance.salesValue)}, total cost is {inr(finance.totalCost)}, and net profit is {inr(finance.netProfit)}.
            </p>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recipe material used for dispatched item</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr><th className="px-4 py-3">Item used</th><th>Per unit</th><th>Total used</th><th>Cost impact</th></tr>
                  </thead>
                  <tbody>
                    {row.recipe.map((item) => (
                      <tr key={item.item} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.item}</td>
                        <td>{item.perUnit}</td>
                        <td>{item.used.toLocaleString('en-IN')}</td>
                        <td>{inr(item.used * item.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Profit calculation</h3>
              </div>
              <div className="space-y-3 p-4 text-sm dark:text-slate-200">
                <div className="flex justify-between"><span>Sales value</span><span className="font-semibold">{inr(finance.salesValue)}</span></div>
                <div className="flex justify-between"><span>Recipe material cost</span><span>{inr(finance.materialCost)}</span></div>
                <div className="flex justify-between"><span>Production cost</span><span>{inr(finance.productionCost)}</span></div>
                <div className="flex justify-between"><span>Freight cost</span><span>{inr(row.freightCost)}</span></div>
                <div className="flex justify-between"><span>Packing/handling cost</span><span>{inr(row.packingCost)}</span></div>
                <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Net profit</span>
                    <span className={finance.netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>{inr(finance.netProfit)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DispatchOverviewPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return dispatches.filter((row) => {
      const statusMatch = status === 'All' || row.status === status
      const queryMatch = !needle || JSON.stringify(row).toLowerCase().includes(needle)
      return statusMatch && queryMatch
    })
  }, [query, status])

  const totals = useMemo(() => {
    return dispatches.reduce((acc, row) => {
      const finance = getFinancials(row)
      acc.qty += row.dispatchedQty
      acc.stockReduced += row.fgBefore - row.fgAfter
      acc.sales += finance.salesValue
      acc.cost += finance.totalCost
      acc.profit += finance.netProfit
      acc.freight += row.freightCost
      return acc
    }, { qty: 0, stockReduced: 0, sales: 0, cost: 0, profit: 0, freight: 0 })
  }, [])

  const margin = totals.sales ? Math.round((totals.profit / totals.sales) * 100) : 0

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Home / Dispatch Overview</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">CEO Dispatch Tracking</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Track dispatched items, finished goods stock reduction, recipe cost, sales value, and net profit.</p>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800 dark:text-slate-100">
            Net profit: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{inr(totals.profit)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Items dispatched" value={totals.qty.toLocaleString('en-IN')} note="Finished goods units" icon={Truck} tone="blue" />
        <MetricCard label="FG units reduced" value={totals.stockReduced.toLocaleString('en-IN')} note="Stock ledger effect" icon={Warehouse} tone="amber" />
        <MetricCard label="Sales value" value={inr(totals.sales)} note="Invoice value" icon={IndianRupee} tone="green" />
        <MetricCard label="Total cost" value={inr(totals.cost)} note="Production + freight + packing" icon={Factory} />
        <MetricCard label="Net profit" value={inr(totals.profit)} note={`${margin}% margin`} icon={ArrowUpRight} tone="green" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dispatch, invoice, customer, product, vehicle..."
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option>All</option>
            <option>Dispatched</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Blocked</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Dispatch</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty dispatched</th>
                <th>FG stock effect</th>
                <th>Sales value</th>
                <th>Total cost</th>
                <th>Net profit</th>
                <th>Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const finance = getFinancials(row)
                return (
                  <tr key={row.challan} onClick={() => setSelected(row)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{row.challan}</p>
                      <p className="text-xs text-slate-500">{row.invoice} / {row.date}</p>
                    </td>
                    <td>{row.customer}</td>
                    <td>{row.product}</td>
                    <td>{row.dispatchedQty.toLocaleString('en-IN')}</td>
                    <td>{row.fgBefore.toLocaleString('en-IN')} to {row.fgAfter.toLocaleString('en-IN')}</td>
                    <td>{inr(finance.salesValue)}</td>
                    <td>{inr(finance.totalCost)}</td>
                    <td className={finance.netProfit >= 0 ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'font-semibold text-rose-700 dark:text-rose-300'}>{inr(finance.netProfit)}</td>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Dispatch attention</p>
          <div className="mt-3 space-y-2">
            {dispatches.filter((row) => row.status !== 'Dispatched').map((row) => (
              <button key={row.challan} onClick={() => setSelected(row)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <span>
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{row.product}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{row.customer} / {row.vehicle}</span>
                </span>
                <StatusBadge status={row.status} />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Profit health by dispatch</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Best dispatch margin</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-300">100 ml premium</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Highest stock movement</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">24 mm caps</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Freight spend</p>
              <p className="mt-1 text-lg font-semibold text-amber-700 dark:text-amber-300">{inr(totals.freight)}</p>
            </div>
          </div>
        </div>
      </div>

      <DispatchModal row={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
