import { useMemo, useState } from 'react'
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Clock3,
  Factory,
  IndianRupee,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { KpiCards } from '../../components/cards/kpi-cards'
import { StatusBadge } from '../../components/badges/status-badge'

const money = (value) => `INR ${value.toLocaleString('en-IN')}`
const planningKey = 'aasa_production_plans'

const planRates = {
  'AERO-200-NOVA': 18,
  'AERO-300-FRESH': 24,
  'AERO-500-IND': 36,
  'AERO-200-LUXE': 32,
  'AERO-300-ELYS': 42,
}

const demoProductionPlans = [
  { id: 'PLAN-260512-001', date: '2026-05-12', shift: 'Morning', shiftTime: '09:00-18:00', customer: 'LuxeAura Perfumes', salesOrder: 'SO-LUXE-1142', batchNo: 'BATCH-LUXE-260512-M1', productCode: 'AERO-200-LUXE', productName: '200 ml Perfume Can - LuxeAura Brand', bom: 'BOM-AERO-200-LUXE', plannedQty: 24000, actualQty: 11200, facility: 'Plant 1 / Filling Line 1', status: 'In Progress', currentStage: 'Filling', stages: ['Can Prep', 'Filling', 'Valve Crimping', 'Leak Test', 'Customer Labelling', 'Packing', 'QC Release'].map((name) => ({ name, status: name === 'Can Prep' ? 'Completed' : name === 'Filling' ? 'Running' : 'Pending' })) },
  { id: 'PLAN-260512-002', date: '2026-05-12', shift: 'General', shiftTime: '10:00-19:00', customer: 'FreshMist Hygiene Pvt Ltd', salesOrder: 'SO-FRESH-778', batchNo: 'BATCH-FRESH-260512-G1', productCode: 'AERO-300-FRESH', productName: '300 ml Aerosol Can - FreshMist Label', bom: 'BOM-AERO-300-FRESH', plannedQty: 18000, actualQty: 14300, facility: 'Plant 1 / Labelling Line', status: 'In Progress', currentStage: 'Customer Labelling', stages: ['Can Prep', 'Filling', 'Valve Crimping', 'Leak Test', 'Customer Labelling', 'Packing', 'QC Release'].map((name, index) => ({ name, status: index < 4 ? 'Completed' : name === 'Customer Labelling' ? 'Running' : 'Pending' })) },
  { id: 'PLAN-260512-003', date: '2026-05-12', shift: 'Night', shiftTime: '21:00-06:00', customer: 'AeroChem Solutions', salesOrder: 'SO-AERO-221', batchNo: 'BATCH-AERO-260512-N1', productCode: 'AERO-500-IND', productName: '500 ml Aerosol Can - IndustrialPro Label', bom: 'BOM-AERO-500-IND', plannedQty: 9600, actualQty: 0, facility: 'Plant 2 / Heavy Fill Line', status: 'Scheduled', currentStage: 'Can Prep', stages: ['Can Prep', 'Filling', 'Valve Crimping', 'Leak Test', 'Customer Labelling', 'Packing', 'QC Release'].map((name) => ({ name, status: name === 'Can Prep' ? 'Running' : 'Pending' })) },
  { id: 'PLAN-260514-001', date: '2026-05-14', shift: 'Morning', shiftTime: '09:00-18:00', customer: 'PrimeShield Consumer Products', salesOrder: 'SO-PRIME-620', batchNo: 'BATCH-PRIME-260514-M1', productCode: 'AERO-300-FRESH', productName: '300 ml Aerosol Can - FreshMist Label', bom: 'BOM-AERO-300-FRESH', plannedQty: 22000, actualQty: 0, facility: 'Plant 1 / Filling Line 2', status: 'Approved', currentStage: 'Can Prep', stages: ['Can Prep', 'Filling', 'Valve Crimping', 'Leak Test', 'Customer Labelling', 'Packing', 'QC Release'].map((name) => ({ name, status: 'Pending' })) },
  { id: 'PLAN-260515-001', date: '2026-05-15', shift: 'General', shiftTime: '10:00-19:00', customer: 'LuxeAura Perfumes', salesOrder: 'SO-LUXE-1175', batchNo: 'BATCH-LUXE-260515-G1', productCode: 'AERO-200-LUXE', productName: '200 ml Perfume Can - LuxeAura Brand', bom: 'BOM-AERO-200-LUXE', plannedQty: 28000, actualQty: 0, facility: 'Plant 1 / Labelling Line', status: 'Pending Approval', currentStage: 'Can Prep', stages: ['Can Prep', 'Filling', 'Valve Crimping', 'Leak Test', 'Customer Labelling', 'Packing', 'QC Release'].map((name) => ({ name, status: 'Pending' })) },
]

const readProductionPlans = () => {
  try {
    const raw = localStorage.getItem(planningKey)
    const stored = raw ? JSON.parse(raw) : []
    return Array.from(new Map([...demoProductionPlans, ...(Array.isArray(stored) ? stored : [])].map((plan) => [plan.id, plan])).values())
  } catch {
    return demoProductionPlans
  }
}

const toDate = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
const startOfWeek = (date) => addDays(date, -((date.getDay() + 6) % 7))
const periodRange = (mode, selectedDate) => {
  const date = toDate(selectedDate)
  if (mode === 'Today') return { start: date, end: date, label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  if (mode === '7 Days') return { start: date, end: addDays(date, 6), label: `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${addDays(date, 6).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` }
  const start = startOfWeek(date)
  return { start, end: addDays(start, 6), label: `${start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${addDays(start, 6).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` }
}
const inRange = (dateText, range) => {
  const date = toDate(dateText)
  return date >= range.start && date <= range.end
}
const planValue = (plan) => Number(plan.plannedQty || 0) * Number(planRates[plan.productCode] || 25)
const planProgress = (plan) => Math.min(100, Math.round((Number(plan.actualQty || 0) / Math.max(Number(plan.plannedQty || 1), 1)) * 100))

const products = [
  {
    code: 'FG-PB-100',
    name: '100 ml Premium Perfume Bottle',
    customer: 'Luxury Scents Co.',
    planned: 5200,
    produced: 3860,
    sold: 3120,
    pendingOrders: 1480,
    sellingPrice: 145,
    unitCost: 92,
    recipeCost: 74,
    materialUsed: 23160,
    stock: 740,
    status: 'Pending',
    bom: [
      { item: 'Glass bottle body 100 ml', qty: '1 pc', consumed: 3860, cost: 38 },
      { item: 'Metal cap', qty: '1 pc', consumed: 3860, cost: 14 },
      { item: 'Spray pump', qty: '1 pc', consumed: 3860, cost: 11 },
      { item: 'Plastic collar', qty: '1 pc', consumed: 3860, cost: 5 },
      { item: 'Front + back label', qty: '2 pc', consumed: 7720, cost: 3 },
      { item: 'Inner mono carton', qty: '1 pc', consumed: 3860, cost: 3 },
    ],
  },
  {
    code: 'FG-PB-050',
    name: '50 ml Classic Perfume Bottle',
    customer: 'Prime Fragrance',
    planned: 8400,
    produced: 7920,
    sold: 7560,
    pendingOrders: 690,
    sellingPrice: 92,
    unitCost: 58,
    recipeCost: 46,
    materialUsed: 47520,
    stock: 360,
    status: 'Completed',
    bom: [
      { item: 'Glass bottle body 50 ml', qty: '1 pc', consumed: 7920, cost: 24 },
      { item: 'Plastic cap', qty: '1 pc', consumed: 7920, cost: 7 },
      { item: 'Spray pump', qty: '1 pc', consumed: 7920, cost: 9 },
      { item: 'Neck crimp collar', qty: '1 pc', consumed: 7920, cost: 3 },
      { item: 'Printed label', qty: '2 pc', consumed: 15840, cost: 2 },
      { item: 'Retail box', qty: '1 pc', consumed: 7920, cost: 1 },
    ],
  },
  {
    code: 'FG-CAP-24',
    name: '24 mm Perfume Bottle Cap',
    customer: 'Nova Aromatics',
    planned: 3600,
    produced: 2140,
    sold: 1680,
    pendingOrders: 1250,
    sellingPrice: 18,
    unitCost: 12,
    recipeCost: 9,
    materialUsed: 6420,
    stock: 460,
    status: 'Blocked',
    bom: [
      { item: 'PP granules', qty: '18 g', consumed: 38520, cost: 5 },
      { item: 'Metalized film sleeve', qty: '1 pc', consumed: 2140, cost: 2 },
      { item: 'Inner plug insert', qty: '1 pc', consumed: 2140, cost: 1 },
      { item: 'Top logo sticker', qty: '1 pc', consumed: 2140, cost: 1 },
    ],
  },
  {
    code: 'FG-BODY-30',
    name: '30 ml Travel Bottle Body',
    customer: 'Sigma Scents',
    planned: 12800,
    produced: 11160,
    sold: 10240,
    pendingOrders: 1840,
    sellingPrice: 36,
    unitCost: 24,
    recipeCost: 19,
    materialUsed: 22320,
    stock: 920,
    status: 'Approved',
    bom: [
      { item: 'Glass tube body 30 ml', qty: '1 pc', consumed: 11160, cost: 15 },
      { item: 'Transparent overcap', qty: '1 pc', consumed: 11160, cost: 3 },
      { item: 'Pump fitment ring', qty: '1 pc', consumed: 11160, cost: 2 },
      { item: 'Barcode label', qty: '1 pc', consumed: 11160, cost: 1 },
    ],
  },
]

const activities = [
  { icon: ReceiptText, label: 'New recipe created', detail: '100 ml Premium Perfume Bottle revision R4 approved by Production', time: '10:45 AM' },
  { icon: Users, label: 'Employee role changed', detail: 'Meera Nair moved from Operator to Supervisor', time: '10:18 AM' },
  { icon: ShoppingCart, label: 'Purchase completed', detail: 'Glass bottle body 100 ml, 12,000 pc received for recipe issue', time: '09:55 AM' },
  { icon: PackageCheck, label: 'Sale posted', detail: 'SO-7821 shipped 720 Classic Perfume Bottles, stock reduced', time: '09:24 AM' },
  { icon: ClipboardList, label: 'BOM item edited', detail: 'Metal cap cost updated from INR 12 to INR 14', time: 'Yesterday' },
]

const orders = [
  { code: 'SO-7821', customer: 'Prime Fragrance', product: '50 ml Classic Perfume Bottle', qty: 720, due: 'Today', status: 'Completed', value: 66240 },
  { code: 'SO-7824', customer: 'Luxury Scents Co.', product: '100 ml Premium Perfume Bottle', qty: 900, due: 'Tomorrow', status: 'Pending', value: 130500 },
  { code: 'SO-7827', customer: 'Nova Aromatics', product: '24 mm Perfume Bottle Cap', qty: 6200, due: '11 May', status: 'Blocked', value: 111600 },
  { code: 'SO-7831', customer: 'Sigma Scents', product: '30 ml Travel Bottle Body', qty: 1300, due: '12 May', status: 'Approved', value: 46800 },
]

const stockMovements = [
  { item: 'Glass bottle body 100 ml', purchase: '+12,000 pc', production: '-3,860 pc', closing: '18,640 pc', effect: 'Supports 18,640 premium bottles' },
  { item: 'Metal cap', purchase: '+8,000 pc', production: '-3,860 pc', closing: '2,240 pc', effect: 'Cap shortage risk for premium bottle orders' },
  { item: 'Spray pump', purchase: '+15,000 pc', production: '-11,780 pc', closing: '9,420 pc', effect: 'Healthy pump stock for 50 ml and 100 ml recipes' },
]

function Panel({ title, icon: Icon, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon size={18} className="text-slate-500 dark:text-slate-300" />}
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function ProductDetail({ product }) {
  const margin = product.sellingPrice - product.unitCost
  return (
    <Panel title={`${product.name} production detail`} icon={Factory} className="xl:col-span-2">
      <div className="grid gap-3 text-sm md:grid-cols-4">
        <div><p className="text-slate-500 dark:text-slate-400">Sold</p><p className="text-lg font-semibold">{product.sold.toLocaleString('en-IN')} units</p></div>
        <div><p className="text-slate-500 dark:text-slate-400">Used in recipe</p><p className="text-lg font-semibold">{product.materialUsed.toLocaleString('en-IN')} units</p></div>
        <div><p className="text-slate-500 dark:text-slate-400">Cost / qty</p><p className="text-lg font-semibold">{money(product.unitCost)}</p></div>
        <div><p className="text-slate-500 dark:text-slate-400">Profit / qty</p><p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">{money(margin)}</p></div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr><th className="py-2">BOM item</th><th>Qty per product</th><th>Consumed</th><th>Cost contribution</th></tr>
          </thead>
          <tbody>
            {product.bom.map((row) => (
              <tr key={row.item} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-2 font-medium">{row.item}</td>
                <td>{row.qty}</td>
                <td>{row.consumed.toLocaleString('en-IN')}</td>
                <td>{money(row.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function CeoProductionPlanView() {
  const [mode, setMode] = useState('Today')
  const [selectedDate, setSelectedDate] = useState('2026-05-12')
  const plans = useMemo(readProductionPlans, [])
  const range = periodRange(mode, selectedDate)
  const visible = plans.filter((plan) => inRange(plan.date, range))
  const totalQty = visible.reduce((sum, plan) => sum + Number(plan.plannedQty || 0), 0)
  const totalValue = visible.reduce((sum, plan) => sum + planValue(plan), 0)
  const running = visible.filter((plan) => plan.status === 'In Progress').length

  return (
    <Panel title="Production planning control view" icon={CalendarDays} className="xl:col-span-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">CEO production period</p>
          <p className="text-lg font-semibold text-slate-950 dark:text-slate-100">{mode}: {range.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{visible.length} plan(s), {totalQty.toLocaleString('en-IN')} cans, {money(totalValue)} planned value</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['Today', '7 Days', 'This Week'].map((item) => (
            <button key={item} onClick={() => setMode(item)} className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === item ? 'bg-slate-950 text-white dark:bg-sky-600' : 'border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'}`}>{item}</button>
          ))}
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
        </div>
      </div>

      <div className="mb-3 grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Plans</p><p className="text-xl font-semibold">{visible.length}</p></div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Running</p><p className="text-xl font-semibold">{running}</p></div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Planned Qty</p><p className="text-xl font-semibold">{totalQty.toLocaleString('en-IN')}</p></div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Planned Value</p><p className="text-xl font-semibold">{money(totalValue)}</p></div>
      </div>

      {!visible.length ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">No production planning exists for this period.</div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {visible.map((plan) => (
            <div key={plan.id} className="rounded-lg border border-slate-200 p-3 shadow-sm dark:border-slate-700">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950 dark:text-slate-100">{plan.productCode}</p>
                    <StatusBadge status={plan.status} />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{plan.customer} / {plan.salesOrder}</p>
                  <p className="text-xs text-slate-500">{plan.batchNo} / {plan.facility}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{money(planValue(plan))}</p>
                  <p className="text-xs text-slate-500">{plan.shift} {plan.shiftTime}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_8rem]">
                <div className="min-w-0 overflow-x-auto">
                  <div className="flex min-w-[520px] gap-1">
                    {(plan.stages || []).map((stage) => {
                      const color = stage.status === 'Completed' ? 'bg-emerald-500 text-white' : stage.status === 'Running' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      return <div key={stage.name} className={`flex-1 rounded px-2 py-1 text-center text-[11px] font-semibold ${color}`}>{stage.name}</div>
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs"><span>Progress</span><strong>{planProgress(plan)}%</strong></div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${planProgress(plan)}%` }} /></div>
                  <p className="mt-1 text-xs text-slate-500">{Number(plan.actualQty || 0).toLocaleString('en-IN')} / {Number(plan.plannedQty || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

export function CeoDashboardPage() {
  const [selectedCode, setSelectedCode] = useState(products[0].code)
  const selected = products.find((item) => item.code === selectedCode) || products[0]

  const summary = useMemo(() => {
    const revenue = products.reduce((sum, item) => sum + item.sold * item.sellingPrice, 0)
    const cost = products.reduce((sum, item) => sum + item.sold * item.unitCost, 0)
    const pendingQty = orders.filter((order) => order.status !== 'Completed').reduce((sum, order) => sum + order.qty, 0)
    const productionQty = products.reduce((sum, item) => sum + item.produced, 0)
    return { revenue, profit: revenue - cost, pendingQty, productionQty }
  }, [])

  const kpis = [
    { label: 'Net sales revenue', value: money(summary.revenue), change: `${orders.length} sales orders tracked` },
    { label: 'Pending production', value: summary.pendingQty.toLocaleString('en-IN'), change: 'Units against open orders' },
    { label: 'Production output', value: summary.productionQty.toLocaleString('en-IN'), change: 'Finished units this cycle' },
    { label: 'Profit / loss', value: money(summary.profit), change: 'Recipe cost after material issue' },
  ]

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Home / Dashboard</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">CEO / MES Management Dashboard</h1>
      </div>

      <KpiCards items={kpis} />

      <div className="grid gap-4 xl:grid-cols-3">
        <CeoProductionPlanView />

        <Panel title="Production products" icon={Factory} className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-3">Product</th>
                  <th>Sold</th>
                  <th>Recipe units used</th>
                  <th>Cost / qty</th>
                  <th>Net sale</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.code}
                    onClick={() => setSelectedCode(product.code)}
                    className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70 ${selectedCode === product.code ? 'bg-sky-50 dark:bg-sky-950/40' : ''}`}
                  >
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.code} • {product.customer}</p>
                    </td>
                    <td>{product.sold.toLocaleString('en-IN')}</td>
                    <td>{product.materialUsed.toLocaleString('en-IN')}</td>
                    <td>{money(product.unitCost)}</td>
                    <td>{money(product.sold * product.sellingPrice)}</td>
                    <td><StatusBadge status={product.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Profitability watch" icon={IndianRupee}>
          <div className="space-y-3">
            {products.map((product) => {
              const marginPct = Math.round(((product.sellingPrice - product.unitCost) / product.sellingPrice) * 100)
              return (
                <button key={product.code} onClick={() => setSelectedCode(product.code)} className="w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{product.name}</span>
                    <span className={marginPct >= 25 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}>{marginPct}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(marginPct * 2, 100)}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
        </Panel>

        <ProductDetail product={selected} />

        <Panel title="Recent MES activity" icon={Activity}>
          <div className="space-y-3">
            {activities.map(({ icon: Icon, label, detail, time }) => (
              <div key={`${label}-${time}`} className="flex gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <Icon size={17} className="mt-0.5 text-slate-500 dark:text-slate-300" />
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{label}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{detail}</p>
                  <p className="mt-1 text-xs text-slate-400">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Sales orders and production need" icon={ClipboardList} className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr><th className="py-2">SO</th><th>Customer</th><th>Item</th><th>Qty</th><th>Due</th><th>Value</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.code} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-2 font-semibold">{order.code}</td>
                    <td>{order.customer}</td>
                    <td>{order.product}</td>
                    <td>{order.qty.toLocaleString('en-IN')}</td>
                    <td>{order.due}</td>
                    <td>{money(order.value)}</td>
                    <td><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Purchase to recipe unit impact" icon={ShoppingCart}>
          <div className="space-y-3">
            {stockMovements.map((row) => (
              <div key={row.item} className="rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-800">
                <p className="font-medium text-slate-800 dark:text-slate-100">{row.item}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300"><TrendingUp size={13} />{row.purchase}</span>
                  <span className="flex items-center gap-1 text-rose-700 dark:text-rose-300"><TrendingDown size={13} />{row.production}</span>
                  <span>{row.closing}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{row.effect}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  )
}
