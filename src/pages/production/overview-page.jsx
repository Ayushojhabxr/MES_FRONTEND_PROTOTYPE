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
  X,
} from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const inr = (value) => `INR ${value.toLocaleString('en-IN')}`

const productionProducts = [
  {
    code: 'FG-PB-100',
    product: '100 ml Premium Perfume Bottle',
    customer: 'Luxury Scents Co.',
    inventoryQty: 740,
    soldQty: 3120,
    netPurchaseRequired: 2240,
    salesOrders: 7,
    salesOrderQty: 1480,
    dispatchedQty: 2380,
    inProductionQty: 1120,
    batchRequired: 4,
    batchRunning: 2,
    unitCost: 92,
    sellingPrice: 145,
    status: 'Pending',
    risk: 'Cap shortage in 2 days',
    recipe: [
      { item: 'Glass bottle body 100 ml', unit: '1 pc', stock: 18640, used: 3860, required: 1480, shortage: 0, cost: 38 },
      { item: 'Metal cap', unit: '1 pc', stock: 2240, used: 3860, required: 1480, shortage: 0, cost: 14 },
      { item: 'Spray pump', unit: '1 pc', stock: 9420, used: 3860, required: 1480, shortage: 0, cost: 11 },
      { item: 'Plastic collar', unit: '1 pc', stock: 1280, used: 3860, required: 1480, shortage: 200, cost: 5 },
      { item: 'Front + back label', unit: '2 pc', stock: 6800, used: 7720, required: 2960, shortage: 0, cost: 3 },
      { item: 'Inner mono carton', unit: '1 pc', stock: 960, used: 3860, required: 1480, shortage: 520, cost: 3 },
    ],
    batches: [
      { batch: 'B-100-241', qty: 560, line: 'Line 2', stage: 'Filling fitment', eta: 'Today 5:30 PM', status: 'Pending' },
      { batch: 'B-100-242', qty: 560, line: 'Line 3', stage: 'Label + carton', eta: 'Tomorrow 11:00 AM', status: 'Approved' },
      { batch: 'B-100-243', qty: 360, line: 'Line 1', stage: 'Material wait', eta: 'Tomorrow 4:00 PM', status: 'Blocked' },
    ],
    orders: [
      { so: 'SO-7824', customer: 'Luxury Scents Co.', qty: 900, dispatch: 420, due: 'Tomorrow', status: 'Pending' },
      { so: 'SO-7838', customer: 'Aroma Retail', qty: 580, dispatch: 0, due: '12 May', status: 'Approved' },
    ],
  },
  {
    code: 'FG-PB-050',
    product: '50 ml Classic Perfume Bottle',
    customer: 'Prime Fragrance',
    inventoryQty: 360,
    soldQty: 7560,
    netPurchaseRequired: 980,
    salesOrders: 11,
    salesOrderQty: 690,
    dispatchedQty: 6840,
    inProductionQty: 900,
    batchRequired: 2,
    batchRunning: 1,
    unitCost: 58,
    sellingPrice: 92,
    status: 'Completed',
    risk: 'On track',
    recipe: [
      { item: 'Glass bottle body 50 ml', unit: '1 pc', stock: 12800, used: 7920, required: 690, shortage: 0, cost: 24 },
      { item: 'Plastic cap', unit: '1 pc', stock: 8800, used: 7920, required: 690, shortage: 0, cost: 7 },
      { item: 'Spray pump', unit: '1 pc', stock: 9420, used: 7920, required: 690, shortage: 0, cost: 9 },
      { item: 'Neck crimp collar', unit: '1 pc', stock: 5200, used: 7920, required: 690, shortage: 0, cost: 3 },
      { item: 'Printed label', unit: '2 pc', stock: 14100, used: 15840, required: 1380, shortage: 0, cost: 2 },
      { item: 'Retail box', unit: '1 pc', stock: 3200, used: 7920, required: 690, shortage: 0, cost: 1 },
    ],
    batches: [
      { batch: 'B-050-198', qty: 480, line: 'Line 4', stage: 'QC hold', eta: 'Today 3:00 PM', status: 'Pending' },
      { batch: 'B-050-199', qty: 420, line: 'Line 4', stage: 'Packing', eta: 'Today 8:00 PM', status: 'Approved' },
    ],
    orders: [
      { so: 'SO-7821', customer: 'Prime Fragrance', qty: 720, dispatch: 720, due: 'Today', status: 'Completed' },
      { so: 'SO-7835', customer: 'Prime Fragrance', qty: 690, dispatch: 0, due: '13 May', status: 'Approved' },
    ],
  },
  {
    code: 'FG-CAP-24',
    product: '24 mm Perfume Bottle Cap',
    customer: 'Nova Aromatics',
    inventoryQty: 460,
    soldQty: 1680,
    netPurchaseRequired: 6200,
    salesOrders: 5,
    salesOrderQty: 6200,
    dispatchedQty: 820,
    inProductionQty: 2140,
    batchRequired: 6,
    batchRunning: 2,
    unitCost: 12,
    sellingPrice: 18,
    status: 'Blocked',
    risk: 'PP granule shortage',
    recipe: [
      { item: 'PP granules', unit: '18 g', stock: 18400, used: 38520, required: 111600, shortage: 93200, cost: 5 },
      { item: 'Metalized film sleeve', unit: '1 pc', stock: 1900, used: 2140, required: 6200, shortage: 4300, cost: 2 },
      { item: 'Inner plug insert', unit: '1 pc', stock: 7600, used: 2140, required: 6200, shortage: 0, cost: 1 },
      { item: 'Top logo sticker', unit: '1 pc', stock: 4800, used: 2140, required: 6200, shortage: 1400, cost: 1 },
    ],
    batches: [
      { batch: 'B-CAP-072', qty: 900, line: 'Moulding 1', stage: 'Material wait', eta: 'Delayed', status: 'Blocked' },
      { batch: 'B-CAP-073', qty: 1240, line: 'Moulding 2', stage: 'Sleeve fitment', eta: 'Tomorrow 1:00 PM', status: 'Pending' },
    ],
    orders: [
      { so: 'SO-7827', customer: 'Nova Aromatics', qty: 6200, dispatch: 820, due: '11 May', status: 'Blocked' },
    ],
  },
  {
    code: 'FG-BODY-30',
    product: '30 ml Travel Bottle Body',
    customer: 'Sigma Scents',
    inventoryQty: 920,
    soldQty: 10240,
    netPurchaseRequired: 760,
    salesOrders: 9,
    salesOrderQty: 1840,
    dispatchedQty: 8940,
    inProductionQty: 1400,
    batchRequired: 3,
    batchRunning: 2,
    unitCost: 24,
    sellingPrice: 36,
    status: 'Approved',
    risk: 'Dispatch capacity tight',
    recipe: [
      { item: 'Glass tube body 30 ml', unit: '1 pc', stock: 15400, used: 11160, required: 1840, shortage: 0, cost: 15 },
      { item: 'Transparent overcap', unit: '1 pc', stock: 2600, used: 11160, required: 1840, shortage: 0, cost: 3 },
      { item: 'Pump fitment ring', unit: '1 pc', stock: 1340, used: 11160, required: 1840, shortage: 500, cost: 2 },
      { item: 'Barcode label', unit: '1 pc', stock: 8200, used: 11160, required: 1840, shortage: 0, cost: 1 },
    ],
    batches: [
      { batch: 'B-030-307', qty: 700, line: 'Line 1', stage: 'Annealing', eta: 'Today 6:00 PM', status: 'Approved' },
      { batch: 'B-030-308', qty: 700, line: 'Line 2', stage: 'Final inspection', eta: 'Tomorrow 9:30 AM', status: 'Pending' },
    ],
    orders: [
      { so: 'SO-7831', customer: 'Sigma Scents', qty: 1300, dispatch: 620, due: '12 May', status: 'Approved' },
      { so: 'SO-7840', customer: 'Travel Mist', qty: 540, dispatch: 0, due: '14 May', status: 'Pending' },
    ],
  },
]

function MetricCard({ label, value, icon: Icon, tone = 'slate', note }) {
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
      {note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>}
    </div>
  )
}

function DetailModal({ product, onClose }) {
  if (!product) return null
  const totalRecipeCost = product.recipe.reduce((sum, item) => sum + item.cost, 0)
  const margin = product.sellingPrice - product.unitCost
  const shortageItems = product.recipe.filter((item) => item.shortage > 0)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{product.code} / Production drilldown</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{product.product}</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 dark:border-slate-700 dark:text-slate-100" aria-label="Close detail">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Inventory available" value={product.inventoryQty.toLocaleString('en-IN')} icon={Boxes} note="Finished goods stock" />
            <MetricCard label="Open SO quantity" value={product.salesOrderQty.toLocaleString('en-IN')} icon={ShoppingCart} note={`${product.salesOrders} sales orders`} tone="blue" />
            <MetricCard label="Batch required" value={product.batchRequired} icon={Factory} note={`${product.batchRunning} currently running`} tone="amber" />
            <MetricCard label="Profit / unit" value={inr(margin)} icon={IndianRupee} note={`Recipe cost ${inr(totalRecipeCost)}`} tone="green" />
          </div>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recipe / BOM consumption</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Shows which item and how many units are needed to manufacture this product.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <tr><th className="px-4 py-3">Item used</th><th>Per finished good</th><th>Stock</th><th>Already used</th><th>Required now</th><th>Shortage</th><th>Cost / unit</th></tr>
                </thead>
                <tbody>
                  {product.recipe.map((item) => (
                    <tr key={item.item} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.item}</td>
                      <td>{item.unit}</td>
                      <td>{item.stock.toLocaleString('en-IN')}</td>
                      <td>{item.used.toLocaleString('en-IN')}</td>
                      <td>{item.required.toLocaleString('en-IN')}</td>
                      <td className={item.shortage ? 'font-semibold text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}>{item.shortage ? item.shortage.toLocaleString('en-IN') : 'No shortage'}</td>
                      <td>{inr(item.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Batch requirement</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-500 dark:text-slate-400"><tr><th className="px-4 py-3">Batch</th><th>Qty</th><th>Line</th><th>Stage</th><th>ETA</th><th>Status</th></tr></thead>
                  <tbody>
                    {product.batches.map((batch) => (
                      <tr key={batch.batch} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                        <td className="px-4 py-3 font-semibold">{batch.batch}</td>
                        <td>{batch.qty}</td>
                        <td>{batch.line}</td>
                        <td>{batch.stage}</td>
                        <td>{batch.eta}</td>
                        <td><StatusBadge status={batch.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Sales order and dispatch</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-500 dark:text-slate-400"><tr><th className="px-4 py-3">SO</th><th>Customer</th><th>Qty</th><th>Dispatched</th><th>Due</th><th>Status</th></tr></thead>
                  <tbody>
                    {product.orders.map((order) => (
                      <tr key={order.so} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                        <td className="px-4 py-3 font-semibold">{order.so}</td>
                        <td>{order.customer}</td>
                        <td>{order.qty}</td>
                        <td>{order.dispatch}</td>
                        <td>{order.due}</td>
                        <td><StatusBadge status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {shortageItems.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle size={17} /> CEO attention required</div>
              <p className="mt-1">Purchase team should close shortages for {shortageItems.map((item) => item.item).join(', ')} before next production release.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductionOverviewPage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return productionProducts
    return productionProducts.filter((item) => JSON.stringify(item).toLowerCase().includes(needle))
  }, [query])

  const totals = useMemo(() => ({
    inventory: productionProducts.reduce((sum, item) => sum + item.inventoryQty, 0),
    sold: productionProducts.reduce((sum, item) => sum + item.soldQty, 0),
    purchase: productionProducts.reduce((sum, item) => sum + item.netPurchaseRequired, 0),
    dispatch: productionProducts.reduce((sum, item) => sum + item.dispatchedQty, 0),
    openOrders: productionProducts.reduce((sum, item) => sum + item.salesOrders, 0),
    revenue: productionProducts.reduce((sum, item) => sum + item.soldQty * item.sellingPrice, 0),
  }), [])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Home / Production Overview</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">CEO Production Tracking</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Product-wise inventory, sales, purchase requirement, dispatch, batch and recipe visibility.</p>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800 dark:text-slate-100">
            Net sales: <span className="font-semibold">{inr(totals.revenue)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="FG inventory" value={totals.inventory.toLocaleString('en-IN')} icon={Boxes} note="Available units" tone="blue" />
        <MetricCard label="Sold quantity" value={totals.sold.toLocaleString('en-IN')} icon={IndianRupee} note="Across products" tone="green" />
        <MetricCard label="Net purchase req." value={totals.purchase.toLocaleString('en-IN')} icon={ShoppingCart} note="Material units needed" tone="amber" />
        <MetricCard label="Sales orders" value={totals.openOrders} icon={PackageCheck} note="Open + recent orders" />
        <MetricCard label="Dispatched" value={totals.dispatch.toLocaleString('en-IN')} icon={Truck} note="Units sent" tone="green" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product, customer, material, order..."
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th>Inventory qty</th>
                <th>Sold qty</th>
                <th>Net purchase req.</th>
                <th>Sales orders</th>
                <th>Dispatch qty</th>
                <th>Batch need</th>
                <th>Profit / unit</th>
                <th>Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const profit = item.sellingPrice - item.unitCost
                return (
                  <tr key={item.code} onClick={() => setSelected(item)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{item.product}</p>
                      <p className="text-xs text-slate-500">{item.code} / {item.customer}</p>
                    </td>
                    <td>{item.inventoryQty.toLocaleString('en-IN')}</td>
                    <td>{item.soldQty.toLocaleString('en-IN')}</td>
                    <td className={item.netPurchaseRequired > 2000 ? 'font-semibold text-amber-700 dark:text-amber-300' : ''}>{item.netPurchaseRequired.toLocaleString('en-IN')}</td>
                    <td>{item.salesOrders} orders / {item.salesOrderQty.toLocaleString('en-IN')} units</td>
                    <td>{item.dispatchedQty.toLocaleString('en-IN')}</td>
                    <td>{item.batchRequired} batches</td>
                    <td className="font-semibold text-emerald-700 dark:text-emerald-300">{inr(profit)}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={(event) => { event.stopPropagation(); setSelected(item) }} className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-sky-600">View</button>
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
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">CEO risk watch</p>
          <div className="mt-3 space-y-2 text-sm">
            {productionProducts.map((item) => (
              <button key={item.code} onClick={() => setSelected(item)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <span>
                  <span className="block font-medium text-slate-800 dark:text-slate-100">{item.product}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.risk}</span>
                </span>
                <StatusBadge status={item.status} />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Production health summary</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Blocked output</p>
              <p className="mt-1 text-lg font-semibold text-rose-700 dark:text-rose-300">6,200 cap units</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Fastest dispatch gap</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">100 ml bottle</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Best margin</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-300">100 ml premium</p>
            </div>
          </div>
        </div>
      </div>

      <DetailModal product={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
