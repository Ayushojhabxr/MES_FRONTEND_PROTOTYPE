import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  Factory,
  IndianRupee,
  PackageCheck,
  Search,
  ShoppingCart,
  Truck,
  Warehouse,
  X,
} from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const inr = (value) => `INR ${value.toLocaleString('en-IN')}`

const inventoryItems = [
  {
    code: 'RM-GL-100',
    item: 'Glass bottle body 100 ml',
    type: 'Raw Material',
    usedIn: ['100 ml Premium Perfume Bottle'],
    warehouse: 'RM Store A',
    stock: 18640,
    reserved: 1480,
    consumed: 3860,
    reorderLevel: 6000,
    purchaseRequired: 0,
    incoming: 12000,
    unitCost: 38,
    coverage: 12,
    status: 'Approved',
    risk: 'Healthy stock',
    recent: [
      { ref: 'GRN-401', action: 'Purchase received', qty: 12000, date: '2026-05-10' },
      { ref: 'ISS-883', action: 'Issued to batch B-100-241', qty: 560, date: '2026-05-10' },
    ],
    recipeImpact: [
      { product: '100 ml Premium Perfume Bottle', perUnit: '1 pc', openOrderQty: 1480, required: 1480, canMake: 18640 },
    ],
  },
  {
    code: 'RM-CAP-M24',
    item: 'Metal cap',
    type: 'Raw Material',
    usedIn: ['100 ml Premium Perfume Bottle'],
    warehouse: 'RM Store B',
    stock: 2240,
    reserved: 1480,
    consumed: 3860,
    reorderLevel: 5000,
    purchaseRequired: 4260,
    incoming: 2000,
    unitCost: 14,
    coverage: 1,
    status: 'Pending',
    risk: 'Cap shortage in 2 days',
    recent: [
      { ref: 'PO-551', action: 'Purchase order raised', qty: 2000, date: '2026-05-09' },
      { ref: 'BOM-R4', action: 'Cost updated', qty: 0, date: '2026-05-09' },
    ],
    recipeImpact: [
      { product: '100 ml Premium Perfume Bottle', perUnit: '1 pc', openOrderQty: 1480, required: 1480, canMake: 2240 },
    ],
  },
  {
    code: 'RM-PUMP-01',
    item: 'Spray pump',
    type: 'Raw Material',
    usedIn: ['100 ml Premium Perfume Bottle', '50 ml Classic Perfume Bottle'],
    warehouse: 'RM Store B',
    stock: 9420,
    reserved: 2170,
    consumed: 11780,
    reorderLevel: 8000,
    purchaseRequired: 750,
    incoming: 15000,
    unitCost: 10,
    coverage: 4,
    status: 'Approved',
    risk: 'Enough for current SO',
    recent: [
      { ref: 'GRN-399', action: 'Purchase received', qty: 15000, date: '2026-05-08' },
      { ref: 'ISS-879', action: 'Issued to 50 ml batch', qty: 900, date: '2026-05-09' },
    ],
    recipeImpact: [
      { product: '100 ml Premium Perfume Bottle', perUnit: '1 pc', openOrderQty: 1480, required: 1480, canMake: 9420 },
      { product: '50 ml Classic Perfume Bottle', perUnit: '1 pc', openOrderQty: 690, required: 690, canMake: 9420 },
    ],
  },
  {
    code: 'RM-PP-GRN',
    item: 'PP granules',
    type: 'Raw Material',
    usedIn: ['24 mm Perfume Bottle Cap'],
    warehouse: 'RM Store C',
    stock: 18400,
    reserved: 111600,
    consumed: 38520,
    reorderLevel: 90000,
    purchaseRequired: 93200,
    incoming: 40000,
    unitCost: 5,
    coverage: 0,
    status: 'Blocked',
    risk: 'Blocking cap production',
    recent: [
      { ref: 'SHORT-18', action: 'Shortage flagged', qty: 93200, date: '2026-05-10' },
      { ref: 'PO-548', action: 'Supplier confirmation pending', qty: 40000, date: '2026-05-09' },
    ],
    recipeImpact: [
      { product: '24 mm Perfume Bottle Cap', perUnit: '18 g', openOrderQty: 6200, required: 111600, canMake: 1022 },
    ],
  },
  {
    code: 'PM-LBL-FB',
    item: 'Front + back label',
    type: 'Packing Material',
    usedIn: ['100 ml Premium Perfume Bottle'],
    warehouse: 'PM Store',
    stock: 6800,
    reserved: 2960,
    consumed: 7720,
    reorderLevel: 9000,
    purchaseRequired: 5160,
    incoming: 6000,
    unitCost: 3,
    coverage: 2,
    status: 'Pending',
    risk: 'Needs print release',
    recent: [
      { ref: 'PO-552', action: 'Label print order placed', qty: 6000, date: '2026-05-10' },
      { ref: 'ISS-880', action: 'Issued to label line', qty: 1120, date: '2026-05-10' },
    ],
    recipeImpact: [
      { product: '100 ml Premium Perfume Bottle', perUnit: '2 pc', openOrderQty: 1480, required: 2960, canMake: 3400 },
    ],
  },
  {
    code: 'PM-BOX-100',
    item: 'Inner mono carton',
    type: 'Packing Material',
    usedIn: ['100 ml Premium Perfume Bottle'],
    warehouse: 'PM Store',
    stock: 960,
    reserved: 1480,
    consumed: 3860,
    reorderLevel: 4000,
    purchaseRequired: 4520,
    incoming: 2500,
    unitCost: 3,
    coverage: 0,
    status: 'Blocked',
    risk: 'Packing cannot close full order',
    recent: [
      { ref: 'SHORT-21', action: 'Packing shortage', qty: 520, date: '2026-05-10' },
      { ref: 'PO-553', action: 'Carton purchase raised', qty: 2500, date: '2026-05-10' },
    ],
    recipeImpact: [
      { product: '100 ml Premium Perfume Bottle', perUnit: '1 pc', openOrderQty: 1480, required: 1480, canMake: 960 },
    ],
  },
  {
    code: 'FG-PB-100',
    item: '100 ml Premium Perfume Bottle',
    type: 'Finished Goods',
    usedIn: ['Sales orders'],
    warehouse: 'FG Store',
    stock: 740,
    reserved: 900,
    consumed: 2380,
    reorderLevel: 1200,
    purchaseRequired: 0,
    incoming: 1120,
    unitCost: 92,
    coverage: 1,
    status: 'Pending',
    risk: 'Production running for SO balance',
    recent: [
      { ref: 'DISP-331', action: 'Dispatched to Luxury Scents', qty: 420, date: '2026-05-10' },
      { ref: 'B-100-241', action: 'Production WIP', qty: 560, date: '2026-05-10' },
    ],
    recipeImpact: [
      { product: 'SO-7824 Luxury Scents Co.', perUnit: 'Finished good', openOrderQty: 900, required: 900, canMake: 740 },
    ],
  },
  {
    code: 'FG-PB-050',
    item: '50 ml Classic Perfume Bottle',
    type: 'Finished Goods',
    usedIn: ['Sales orders'],
    warehouse: 'FG Store',
    stock: 360,
    reserved: 690,
    consumed: 7560,
    reorderLevel: 1000,
    purchaseRequired: 0,
    incoming: 900,
    unitCost: 58,
    coverage: 1,
    status: 'Completed',
    risk: 'On track after next batch',
    recent: [
      { ref: 'DISP-329', action: 'Order dispatched', qty: 720, date: '2026-05-10' },
      { ref: 'B-050-198', action: 'QC hold', qty: 480, date: '2026-05-10' },
    ],
    recipeImpact: [
      { product: 'SO-7835 Prime Fragrance', perUnit: 'Finished good', openOrderQty: 690, required: 690, canMake: 360 },
    ],
  },
]

function MetricCard({ label, value, icon: Icon, note, tone = 'slate' }) {
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

function InventoryModal({ item, onClose }) {
  if (!item) return null
  const stockValue = item.stock * item.unitCost
  const shortage = Math.max(item.reserved - item.stock, 0)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.code} / {item.type}</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{item.item}</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 dark:border-slate-700 dark:text-slate-100" aria-label="Close detail">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Available stock" value={item.stock.toLocaleString('en-IN')} icon={Boxes} note={item.warehouse} tone="blue" />
            <MetricCard label="Reserved / demand" value={item.reserved.toLocaleString('en-IN')} icon={Factory} note="For recipe, SO or batch" tone="amber" />
            <MetricCard label="Purchase required" value={item.purchaseRequired.toLocaleString('en-IN')} icon={ShoppingCart} note={`${item.incoming.toLocaleString('en-IN')} incoming`} tone={item.purchaseRequired ? 'red' : 'green'} />
            <MetricCard label="Stock value" value={inr(stockValue)} icon={IndianRupee} note={`${inr(item.unitCost)} per unit`} tone="green" />
          </div>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recipe and production impact</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Shows where this material is used and how much production the current stock can cover.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <tr><th className="px-4 py-3">Product / order</th><th>Usage</th><th>Open qty</th><th>Required units</th><th>Can cover</th></tr>
                </thead>
                <tbody>
                  {item.recipeImpact.map((row) => (
                    <tr key={row.product} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.product}</td>
                      <td>{row.perUnit}</td>
                      <td>{row.openOrderQty.toLocaleString('en-IN')}</td>
                      <td>{row.required.toLocaleString('en-IN')}</td>
                      <td className={row.canMake < row.required ? 'font-semibold text-rose-700 dark:text-rose-300' : 'font-semibold text-emerald-700 dark:text-emerald-300'}>{row.canMake.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent inventory movement</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500 dark:text-slate-400"><tr><th className="px-4 py-3">Reference</th><th>Action</th><th>Qty</th><th>Date</th></tr></thead>
                <tbody>
                  {item.recent.map((row) => (
                    <tr key={row.ref} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                      <td className="px-4 py-3 font-semibold">{row.ref}</td>
                      <td>{row.action}</td>
                      <td>{row.qty ? row.qty.toLocaleString('en-IN') : '-'}</td>
                      <td>{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {(shortage > 0 || item.purchaseRequired > 0) && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle size={17} /> CEO action</div>
              <p className="mt-1">Purchase team should arrange {Math.max(shortage, item.purchaseRequired).toLocaleString('en-IN')} units for {item.item}. Current risk: {item.risk}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function InventoryOverviewPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return inventoryItems.filter((item) => {
      const typeMatch = type === 'All' || item.type === type
      const queryMatch = !needle || JSON.stringify(item).toLowerCase().includes(needle)
      return typeMatch && queryMatch
    })
  }, [query, type])

  const totals = useMemo(() => ({
    stockValue: inventoryItems.reduce((sum, item) => sum + item.stock * item.unitCost, 0),
    purchaseRequired: inventoryItems.reduce((sum, item) => sum + item.purchaseRequired, 0),
    shortageItems: inventoryItems.filter((item) => item.status === 'Blocked' || item.purchaseRequired > 0).length,
    incoming: inventoryItems.reduce((sum, item) => sum + item.incoming, 0),
    fgStock: inventoryItems.filter((item) => item.type === 'Finished Goods').reduce((sum, item) => sum + item.stock, 0),
  }), [])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Home / Inventory Overview</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">CEO Inventory Tracking</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Perfume bottle raw material, packing material, finished goods, recipe coverage and purchase risk.</p>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800 dark:text-slate-100">
            Inventory value: <span className="font-semibold">{inr(totals.stockValue)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Stock value" value={inr(totals.stockValue)} icon={IndianRupee} note="Raw + packing + FG" tone="green" />
        <MetricCard label="Purchase required" value={totals.purchaseRequired.toLocaleString('en-IN')} icon={ShoppingCart} note="Units to procure" tone="red" />
        <MetricCard label="Shortage risk" value={totals.shortageItems} icon={AlertTriangle} note="Items needing action" tone="amber" />
        <MetricCard label="Incoming stock" value={totals.incoming.toLocaleString('en-IN')} icon={Truck} note="Open PO / GRN" tone="blue" />
        <MetricCard label="FG available" value={totals.fgStock.toLocaleString('en-IN')} icon={PackageCheck} note="Ready for dispatch" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item, product, warehouse, PO, risk..."
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option>All</option>
            <option>Raw Material</option>
            <option>Packing Material</option>
            <option>Finished Goods</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th>Type</th>
                <th>Stock</th>
                <th>Reserved</th>
                <th>Consumed</th>
                <th>Purchase req.</th>
                <th>Coverage</th>
                <th>Stock value</th>
                <th>Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.code} onClick={() => setSelected(item)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.item}</p>
                    <p className="text-xs text-slate-500">{item.code} / {item.warehouse}</p>
                  </td>
                  <td>{item.type}</td>
                  <td>{item.stock.toLocaleString('en-IN')}</td>
                  <td>{item.reserved.toLocaleString('en-IN')}</td>
                  <td>{item.consumed.toLocaleString('en-IN')}</td>
                  <td className={item.purchaseRequired ? 'font-semibold text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}>{item.purchaseRequired ? item.purchaseRequired.toLocaleString('en-IN') : 'No need'}</td>
                  <td>{item.coverage} days</td>
                  <td>{inr(item.stock * item.unitCost)}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={(event) => { event.stopPropagation(); setSelected(item) }} className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-sky-600">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">CEO shortage watch</p>
          <div className="mt-3 space-y-2">
            {inventoryItems.filter((item) => item.purchaseRequired > 0 || item.status === 'Blocked').map((item) => (
              <button key={item.code} onClick={() => setSelected(item)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <span>
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{item.item}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.risk}</span>
                </span>
                <StatusBadge status={item.status} />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Inventory health summary</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Production blocker</p>
              <p className="mt-1 text-lg font-semibold text-rose-700 dark:text-rose-300">PP granules</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Packing blocker</p>
              <p className="mt-1 text-lg font-semibold text-amber-700 dark:text-amber-300">Inner mono carton</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Healthy stock</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-300">Glass body 100 ml</p>
            </div>
          </div>
        </div>
      </div>

      <InventoryModal item={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
