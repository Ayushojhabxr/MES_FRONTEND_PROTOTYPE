import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, Eye, Search, ShieldCheck, X, XCircle } from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const itemKey = 'aasa_bom_items'
const productKey = 'aasa_bom_products'
const inr = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const seedItems = [
  { id: 'IT-GL-100', name: 'Glass bottle body 100 ml', category: 'Item', uom: 'Each', warehouse: '04', stock: 18640, price: 38, weight: '120g' },
  { id: 'IT-CAP-M24', name: 'Metal cap 24 mm', category: 'Item', uom: 'Each', warehouse: '04', stock: 2240, price: 14, weight: '8g' },
  { id: 'IT-PUMP-01', name: 'Spray pump', category: 'Item', uom: 'Each', warehouse: '04', stock: 9420, price: 11, weight: '6g' },
  { id: 'IT-PP-GRN', name: 'PP granules', category: 'Item', uom: 'Gram', warehouse: '04', stock: 18400, price: 0.28, weight: '1g' },
  { id: 'RES-LAB-01', name: 'Labour - Production Staff', category: 'Resource', uom: 'Hr', warehouse: '04', stock: 80, price: 100, weight: '-' },
]

const seedProducts = [
  {
    id: 'BOM-PB-100',
    productNo: 'FG-PB-100',
    description: '100 ml Premium Perfume Bottle',
    parentQty: 1,
    bomType: 'Production',
    warehouse: '04',
    priceList: 'MSRP',
    productPrice: 145,
    status: 'Approved',
    stages: ['Preparation', 'Assembly', 'Packing'],
    lines: [
      { stage: 'Preparation', type: 'Item', itemId: 'IT-GL-100', quantity: 1, warehouse: '04', issueMethod: 'Backflush', priceList: 'MSRP', comments: 'Bottle body' },
      { stage: 'Assembly', type: 'Item', itemId: 'IT-CAP-M24', quantity: 1, warehouse: '04', issueMethod: 'Backflush', priceList: 'MSRP', comments: 'Cap fitment' },
    ],
  },
]

const readStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const normalizeBom = (bom, items) => {
  const legacyRecipe = Array.isArray(bom?.recipe) ? bom.recipe : []
  const sourceLines = Array.isArray(bom?.lines) ? bom.lines : legacyRecipe.map((line) => ({
    stage: bom?.stages?.[0] || 'Stage 1',
    type: 'Item',
    itemId: line.itemId || items[0]?.id || '',
    quantity: Number(line.qty || line.quantity || 1),
    warehouse: bom?.warehouse || '04',
    issueMethod: 'Backflush',
    priceList: bom?.priceList || 'MSRP',
    comments: '',
  }))
  return {
    id: bom?.id || `BOM-${Date.now()}`,
    productNo: bom?.productNo || bom?.code || '',
    description: bom?.description || bom?.name || '',
    parentQty: Number(bom?.parentQty || 1),
    bomType: bom?.bomType || 'Production',
    warehouse: bom?.warehouse || '04',
    priceList: bom?.priceList || 'MSRP',
    distrRule: bom?.distrRule || '',
    project: bom?.project || '',
    plannedAverageProductionSize: Number(bom?.plannedAverageProductionSize || 1),
    productPrice: Number(bom?.productPrice || bom?.sellingPrice || 0),
    status: bom?.status || 'Draft',
    rejectionReason: bom?.rejectionReason || '',
    holdReason: bom?.holdReason || '',
    approvedAt: bom?.approvedAt || '',
    rejectedAt: bom?.rejectedAt || '',
    holdAt: bom?.holdAt || '',
    stages: Array.isArray(bom?.stages) && bom.stages.length ? bom.stages : ['Stage 1'],
    lines: sourceLines.map((line) => ({
      stage: line.stage || bom?.stages?.[0] || 'Stage 1',
      type: line.type || 'Item',
      itemId: line.itemId || items[0]?.id || '',
      quantity: Number(line.quantity || line.qty || 0),
      warehouse: line.warehouse || bom?.warehouse || '04',
      issueMethod: line.issueMethod || 'Backflush',
      priceList: line.priceList || bom?.priceList || 'MSRP',
      comments: line.comments || '',
    })),
  }
}

const findItem = (items, itemId) => items.find((item) => item.id === itemId) || items[0] || {}
const lineCost = (line, items) => Number(line?.quantity || 0) * Number(findItem(items, line?.itemId)?.price || 0)
const bomCost = (bom, items) => (Array.isArray(bom?.lines) ? bom.lines : []).reduce((sum, line) => sum + lineCost(line, items), 0)

function MetricCard({ label, value, note, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    green: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
    red: 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30',
  }
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  )
}

function ReasonModal({ open, action, bom, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  if (!open || !bom) return null
  const isHold = action === 'On Hold'
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{bom.productNo}</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{isHold ? 'Put BOM On Hold' : 'Reject BOM'}</h2>
          </div>
          <button onClick={onClose} className="rounded border border-slate-200 p-2 dark:border-slate-700 dark:text-slate-100"><X size={16} /></button>
        </div>
        <label className="mt-4 block text-sm font-semibold text-slate-800 dark:text-slate-100">{isHold ? 'Reason for hold' : 'Reason for rejection'}</label>
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder={isHold ? 'Explain why this BOM is being put on hold...' : 'Explain why this BOM is rejected...'} />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">Cancel</button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            style={{ backgroundColor: isHold ? '#f59e0b' : '#dc2626', color: isHold ? '#111827' : '#ffffff' }}
            className="rounded px-3 py-2 text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            {isHold ? 'Confirm Hold' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BomDetailModal({ bom, items, onClose, onApprove, onAskReject, onAskHold }) {
  if (!bom) return null
  const cost = bomCost(bom, items)
  const margin = Number(bom.productPrice || 0) - cost

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{bom.productNo} / {bom.bomType}</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{bom.description || 'Unnamed BOM'}</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 dark:border-slate-700 dark:text-slate-100" aria-label="Close detail"><X size={18} /></button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="BOM cost" value={inr(cost)} note="Component cost rollup" />
            <MetricCard label="Product price" value={inr(bom.productPrice)} note="Selling / transfer price" />
            <MetricCard label="Margin" value={inr(margin)} note="Price minus BOM cost" tone={margin >= 0 ? 'green' : 'red'} />
            <MetricCard label="Stages" value={(bom.stages || []).length} note={(bom.stages || []).join(', ')} />
          </div>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">BOM components for approval</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1450px] table-fixed text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <tr><th className="w-[130px] px-4 py-3">Stage</th><th className="w-[110px]">Type</th><th className="w-[170px]">No.</th><th className="w-[300px]">Description</th><th className="w-[100px]">Qty</th><th className="w-[100px]">UOM</th><th className="w-[110px]">Warehouse</th><th className="w-[130px]">Issue Method</th><th className="w-[120px]">Unit Price</th><th className="w-[120px]">Total</th><th className="w-[180px]">Comments</th></tr>
                </thead>
                <tbody>
                  {bom.lines.map((line, index) => {
                    const item = findItem(items, line.itemId)
                    return (
                      <tr key={`${line.itemId}-${index}`} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                        <td className="px-4 py-3 font-medium">{line.stage}</td>
                        <td>{line.type}</td>
                        <td>{line.itemId}</td>
                        <td className="truncate" title={item.name}>{item.name}</td>
                        <td>{line.quantity}</td>
                        <td>{item.uom}</td>
                        <td>{line.warehouse}</td>
                        <td>{line.issueMethod}</td>
                        <td>{inr(item.price)}</td>
                        <td className="font-semibold">{inr(lineCost(line, items))}</td>
                        <td className="truncate" title={line.comments}>{line.comments || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {bom.rejectionReason && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
              <p className="font-semibold">Rejection reason</p>
              <p className="mt-1">{bom.rejectionReason}</p>
            </div>
          )}
          {bom.holdReason && (
            <div style={{ backgroundColor: '#fffbeb', borderColor: '#f59e0b', color: '#92400e' }} className="rounded-xl border p-4 text-sm">
              <p className="font-semibold">Hold reason</p>
              <p className="mt-1">{bom.holdReason}</p>
            </div>
          )}

        </div>
        <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap justify-end gap-2">
            <button onClick={onClose} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">Close</button>
            <button onClick={onApprove} className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-emerald-700/20"><CheckCircle2 size={16} /> Approve</button>
            <button onClick={onAskHold} style={{ backgroundColor: '#f59e0b', color: '#111827' }} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-orange-700/20"><Clock size={16} /> On Hold</button>
            <button onClick={onAskReject} style={{ backgroundColor: '#dc2626', color: '#ffffff' }} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-red-700/20"><XCircle size={16} /> Reject</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BomApprovalsPage() {
  const [items] = useState(() => readStored(itemKey, seedItems))
  const [boms, setBoms] = useState(() => {
    const stored = readStored(productKey, seedProducts)
    return (Array.isArray(stored) ? stored : seedProducts).map((bom) => normalizeBom(bom, readStored(itemKey, seedItems)))
  })
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [reasonAction, setReasonAction] = useState(null)
  const [reasonBom, setReasonBom] = useState(null)
  const [message, setMessage] = useState('')

  const saveBoms = (next) => {
    setBoms(next)
    localStorage.setItem(productKey, JSON.stringify(next))
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return boms
    return boms.filter((bom) => JSON.stringify(bom).toLowerCase().includes(needle))
  }, [boms, query])

  const counts = {
    total: boms.length,
    pending: boms.filter((bom) => ['Draft', 'On Hold', 'Pending'].includes(bom.status)).length,
    approved: boms.filter((bom) => bom.status === 'Approved').length,
    rejected: boms.filter((bom) => bom.status === 'Rejected').length,
  }

  const updateBom = (id, patch) => {
    const next = boms.map((bom) => bom.id === id ? { ...bom, ...patch } : bom)
    saveBoms(next)
    setSelected((prev) => prev?.id === id ? { ...prev, ...patch } : prev)
  }

  const approveBom = (bom) => {
    updateBom(bom.id, { status: 'Approved', approvedAt: new Date().toISOString(), rejectedAt: '', holdAt: '', rejectionReason: '', holdReason: '' })
    setMessage(`${bom.productNo || 'BOM'} approved successfully.`)
  }

  const openReason = (action, bom) => {
    setReasonAction(action)
    setReasonBom(bom)
  }

  const closeReason = () => {
    setReasonAction(null)
    setReasonBom(null)
  }

  const confirmReason = (reason) => {
    if (!reasonBom || !reasonAction) return
    if (reasonAction === 'Rejected') {
      updateBom(reasonBom.id, { status: 'Rejected', rejectedAt: new Date().toISOString(), approvedAt: '', rejectionReason: reason })
      setMessage(`${reasonBom.productNo || 'BOM'} rejected. Reason saved.`)
    } else {
      updateBom(reasonBom.id, { status: 'On Hold', holdAt: new Date().toISOString(), approvedAt: '', holdReason: reason })
      setMessage(`${reasonBom.productNo || 'BOM'} put on hold. Reason saved.`)
    }
    closeReason()
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Production / BOM Approvals</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">BOM Approval Queue</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Track saved BOMs from localStorage, review full component details, approve, or reject with a reason.</p>
        </div>
        <ShieldCheck className="text-slate-500 dark:text-slate-300" size={28} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total BOMs" value={counts.total} note="Saved in browser storage" />
        <MetricCard label="Pending Approval" value={counts.pending} note="Draft, Pending, or On Hold" tone="amber" />
        <MetricCard label="Approved" value={counts.approved} note="Released for production" tone="green" />
        <MetricCard label="Rejected" value={counts.rejected} note="Rejected with reason" tone="red" />
      </div>

      {message && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-semibold">Dismiss</button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search BOM, product, stage, component, status..." className="w-full rounded border border-slate-300 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr><th className="px-4 py-3">BOM</th><th>Stages</th><th>Components</th><th>BOM Cost</th><th>Product Price</th><th>Status</th><th>Reason / Last Action</th><th className="w-[360px] px-4 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((bom) => (
                <tr key={bom.id} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{bom.productNo || 'New Product'}</p>
                    <p className="text-xs text-slate-500">{bom.description || 'No description'}</p>
                  </td>
                  <td>{(bom.stages || []).length}</td>
                  <td>{(bom.lines || []).length}</td>
                  <td>{inr(bomCost(bom, items))}</td>
                  <td>{inr(bom.productPrice)}</td>
                  <td><StatusBadge status={bom.status} /></td>
                  <td className="max-w-xs">
                    <p className="truncate" title={bom.rejectionReason || bom.holdReason}>{bom.rejectionReason || bom.holdReason || '-'}</p>
                    <p className="text-xs text-slate-500">{bom.approvedAt ? `Approved ${new Date(bom.approvedAt).toLocaleString()}` : bom.rejectedAt ? `Rejected ${new Date(bom.rejectedAt).toLocaleString()}` : bom.holdAt ? `On hold ${new Date(bom.holdAt).toLocaleString()}` : ''}</p>
                  </td>
                  <td className="w-[360px] px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSelected(bom)} className="flex items-center gap-1 rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-slate-950/10 dark:bg-sky-600"><Eye size={14} /> View</button>
                      <button onClick={() => approveBom(bom)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-emerald-700/20">Approve</button>
                      <button onClick={() => openReason('On Hold', bom)} style={{ backgroundColor: '#f59e0b', color: '#111827' }} className="rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-orange-700/20">On Hold</button>
                      <button onClick={() => openReason('Rejected', bom)} style={{ backgroundColor: '#dc2626', color: '#ffffff' }} className="rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-red-700/20">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BomDetailModal
        bom={selected}
        items={items}
        onClose={() => setSelected(null)}
        onApprove={() => selected && approveBom(selected)}
        onAskReject={() => selected && openReason('Rejected', selected)}
        onAskHold={() => selected && openReason('On Hold', selected)}
      />
      <ReasonModal open={!!reasonAction} action={reasonAction} bom={reasonBom} onClose={closeReason} onConfirm={confirmReason} />
    </section>
  )
}
