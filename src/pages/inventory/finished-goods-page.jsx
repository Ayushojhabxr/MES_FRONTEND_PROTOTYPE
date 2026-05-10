import { useMemo, useState } from 'react'
import { Boxes, ClipboardCheck, Eye, MapPin, PackageCheck, Plus, Search, Truck } from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const seedFinishedGoods = [
  { id: 1, fgCode: 'FG-PB-100', product: '100 ml Premium Perfume Bottle', batch: 'B-260510-01', bom: 'BOM-FG-PB-100', productionOrder: 'PROD-6001', warehouse: 'Finished Goods Store', bin: 'FG-A-01', producedQty: 4200, availableQty: 2780, reservedQty: 900, pickedQty: 320, dispatchReadyQty: 200, holdQty: 0, customer: 'Glow Retail', salesOrder: 'SO-8801', mfgDate: '2026-05-08', qcStatus: 'Approved', status: 'Available', unitCost: 77 },
  { id: 2, fgCode: 'FG-CAP-24', product: '24 mm Perfume Bottle Cap', batch: 'B-260509-02', bom: 'BOM-CAP-24', productionOrder: 'PROD-5998', warehouse: 'Dispatch Area', bin: 'DSP-B-02', producedQty: 8600, availableQty: 1200, reservedQty: 5400, pickedQty: 1400, dispatchReadyQty: 600, holdQty: 0, customer: 'Aroma House', salesOrder: 'SO-8789', mfgDate: '2026-05-09', qcStatus: 'Approved', status: 'Dispatch Ready', unitCost: 8.04 },
  { id: 3, fgCode: 'FG-PUMP-01', product: 'Spray Pump Assembly', batch: 'B-260507-01', bom: 'BOM-PUMP-01', productionOrder: 'PROD-5981', warehouse: 'Finished Goods Store', bin: 'FG-C-03', producedQty: 3200, availableQty: 1960, reservedQty: 840, pickedQty: 0, dispatchReadyQty: 0, holdQty: 400, customer: 'Not assigned', salesOrder: '-', mfgDate: '2026-05-07', qcStatus: 'QC Hold', status: 'QC Hold', unitCost: 11 },
  { id: 4, fgCode: 'FG-BOX-100', product: 'Inner Mono Carton', batch: 'B-260506-03', bom: 'BOM-BOX-100', productionOrder: 'PROD-5964', warehouse: 'Packaging Store', bin: 'PKG-R-12', producedQty: 12000, availableQty: 10400, reservedQty: 1100, pickedQty: 500, dispatchReadyQty: 0, holdQty: 0, customer: 'Multiple orders', salesOrder: 'SO-MIX', mfgDate: '2026-05-06', qcStatus: 'Approved', status: 'Reserved', unitCost: 3 },
  { id: 5, fgCode: 'FG-LBL-FB', product: 'Front + Back Label Set', batch: 'B-260504-01', bom: 'BOM-LBL-FB', productionOrder: 'PROD-5937', warehouse: 'Finished Goods Store', bin: 'FG-D-09', producedQty: 18000, availableQty: 13750, reservedQty: 2600, pickedQty: 1650, dispatchReadyQty: 0, holdQty: 0, customer: 'Aroma House', salesOrder: 'SO-8770', mfgDate: '2026-05-04', qcStatus: 'Approved', status: 'Picked', unitCost: 3 },
]

const emptyDraft = {
  fgCode: '',
  product: '',
  batch: '',
  bom: '',
  productionOrder: '',
  warehouse: 'Finished Goods Store',
  bin: '',
  producedQty: 0,
  availableQty: 0,
  reservedQty: 0,
  pickedQty: 0,
  dispatchReadyQty: 0,
  holdQty: 0,
  customer: '',
  salesOrder: '',
  mfgDate: '2026-05-10',
  qcStatus: 'Approved',
  status: 'Available',
  unitCost: 0,
}

const warehouses = ['Finished Goods Store', 'Dispatch Area', 'Packaging Store', 'QC Hold Area', 'Rejected Store']
const statuses = ['Available', 'Reserved', 'Picked', 'Dispatch Ready', 'QC Hold', 'Blocked']

const currency = (value) => `INR ${Math.round(value || 0).toLocaleString('en-IN')}`
const number = (value) => Number(value || 0).toLocaleString('en-IN')

function StatCard({ icon: Icon, label, value, tone = 'sky', sub }) {
  const tones = {
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600"><Icon size={14} />{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-950">{value}</div>
      {sub ? <div className="text-xs text-slate-500">{sub}</div> : null}
    </div>
  )
}

function FinishedGoodModal({ record, onClose, onSave }) {
  const [draft, setDraft] = useState(record || emptyDraft)
  const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))
  const numeric = ['producedQty', 'availableQty', 'reservedQty', 'pickedQty', 'dispatchReadyQty', 'holdQty', 'unitCost']

  const save = () => {
    const next = { ...draft, id: record?.id || Date.now() }
    numeric.forEach((key) => { next[key] = Number(next[key] || 0) })
    onSave(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-5xl rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{record ? 'Edit Finished Goods Batch' : 'Add Finished Goods Batch'}</h2>
            <p className="text-xs text-slate-500">Track location, availability, reservation, dispatch readiness, and valuation.</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-sm font-semibold">Product & Batch</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="FG Code" value={draft.fgCode} onChange={(v) => update('fgCode', v)} />
              <Field label="Product" value={draft.product} onChange={(v) => update('product', v)} />
              <Field label="Batch No." value={draft.batch} onChange={(v) => update('batch', v)} />
              <Field label="BOM" value={draft.bom} onChange={(v) => update('bom', v)} />
              <Field label="Production Order" value={draft.productionOrder} onChange={(v) => update('productionOrder', v)} />
              <Field label="MFG Date" type="date" value={draft.mfgDate} onChange={(v) => update('mfgDate', v)} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-sm font-semibold">Storage & Status</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <SelectField label="Warehouse" value={draft.warehouse} onChange={(v) => update('warehouse', v)} options={warehouses} />
              <Field label="Rack / Bin" value={draft.bin} onChange={(v) => update('bin', v)} />
              <SelectField label="QC Status" value={draft.qcStatus} onChange={(v) => update('qcStatus', v)} options={['Approved', 'QC Hold', 'Rejected']} />
              <SelectField label="Stock Status" value={draft.status} onChange={(v) => update('status', v)} options={statuses} />
              <Field label="Customer / Demand" value={draft.customer} onChange={(v) => update('customer', v)} />
              <Field label="Sales Order" value={draft.salesOrder} onChange={(v) => update('salesOrder', v)} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-3 lg:col-span-2">
            <h3 className="text-sm font-semibold">Quantity & Cost</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
              <Field label="Produced" type="number" value={draft.producedQty} onChange={(v) => update('producedQty', v)} />
              <Field label="Available" type="number" value={draft.availableQty} onChange={(v) => update('availableQty', v)} />
              <Field label="Reserved" type="number" value={draft.reservedQty} onChange={(v) => update('reservedQty', v)} />
              <Field label="Picked" type="number" value={draft.pickedQty} onChange={(v) => update('pickedQty', v)} />
              <Field label="Dispatch Ready" type="number" value={draft.dispatchReadyQty} onChange={(v) => update('dispatchReadyQty', v)} />
              <Field label="Hold" type="number" value={draft.holdQty} onChange={(v) => update('holdQty', v)} />
              <Field label="Unit Cost" type="number" value={draft.unitCost} onChange={(v) => update('unitCost', v)} />
            </div>
          </section>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-4 py-3">
          <button onClick={save} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save Finished Goods</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase text-slate-500">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-400" />
    </label>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-400">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}

export default function FinishedGoodsPage() {
  const [records, setRecords] = useState(seedFinishedGoods)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [warehouse, setWarehouse] = useState('All')
  const [modal, setModal] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return records.filter((row) => {
      const matchesSearch = !q || [row.fgCode, row.product, row.batch, row.bom, row.customer, row.salesOrder, row.warehouse].join(' ').toLowerCase().includes(q)
      return matchesSearch && (status === 'All' || row.status === status) && (warehouse === 'All' || row.warehouse === warehouse)
    })
  }, [records, search, status, warehouse])

  const totals = useMemo(() => records.reduce((acc, row) => {
    acc.produced += row.producedQty
    acc.available += row.availableQty
    acc.reserved += row.reservedQty
    acc.dispatchReady += row.dispatchReadyQty
    acc.value += row.availableQty * row.unitCost
    return acc
  }, { produced: 0, available: 0, reserved: 0, dispatchReady: 0, value: 0 }), [records])

  const saveRecord = (record) => {
    setRecords((prev) => prev.some((row) => row.id === record.id) ? prev.map((row) => row.id === record.id ? record : row) : [record, ...prev])
    setModal(null)
  }

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Inventory / Finished Goods</p>
            <h1 className="text-2xl font-semibold text-slate-950">Finished Goods Inventory</h1>
            <p className="text-sm text-slate-600">Batch-wise stock, location, reservation, picking, dispatch readiness, and value in one compact view.</p>
          </div>
          <button onClick={() => setModal({ mode: 'create' })} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Add FG Batch</button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Boxes} label="Produced Qty" value={number(totals.produced)} sub="Across active batches" />
        <StatCard icon={PackageCheck} label="Available" value={number(totals.available)} tone="green" sub="Can be allocated" />
        <StatCard icon={ClipboardCheck} label="Reserved" value={number(totals.reserved)} tone="indigo" sub="Assigned to orders" />
        <StatCard icon={Truck} label="Dispatch Ready" value={number(totals.dispatchReady)} tone="amber" sub="Ready to ship" />
        <StatCard icon={MapPin} label="FG Value" value={currency(totals.value)} sub="Available stock value" />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product, batch, SO, customer, warehouse..." className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-sky-400" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
            {['All', ...statuses].map((option) => <option key={option}>{option}</option>)}
          </select>
          <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
            {['All', ...warehouses].map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full text-left text-sm">
            <thead className="bg-sky-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2">Product / Batch</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Produced</th>
                <th className="px-3 py-2">Available</th>
                <th className="px-3 py-2">Reserved</th>
                <th className="px-3 py-2">Picked / Ready</th>
                <th className="px-3 py-2">Order Link</th>
                <th className="px-3 py-2">QC</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2 font-semibold text-slate-950">{row.fgCode}<div className="text-xs font-normal text-slate-500">{row.product}<br />{row.batch} / {row.bom}</div></td>
                  <td className="px-3 py-2">{row.warehouse}<div className="text-xs text-slate-500">{row.bin}</div></td>
                  <td className="px-3 py-2">{number(row.producedQty)}<div className="text-xs text-slate-500">{row.productionOrder}</div></td>
                  <td className="px-3 py-2 font-semibold text-emerald-700">{number(row.availableQty)}</td>
                  <td className="px-3 py-2">{number(row.reservedQty)}</td>
                  <td className="px-3 py-2">{number(row.pickedQty)} / {number(row.dispatchReadyQty)}</td>
                  <td className="px-3 py-2">{row.customer}<div className="text-xs text-slate-500">{row.salesOrder}</div></td>
                  <td className="px-3 py-2"><StatusBadge status={row.qcStatus} /><div className="mt-1 text-xs text-slate-500">{row.mfgDate}</div></td>
                  <td className="px-3 py-2">{currency(row.availableQty * row.unitCost)}<div className="text-xs text-slate-500">@ {currency(row.unitCost)}</div></td>
                  <td className="px-3 py-2"><StatusBadge status={row.status} /></td>
                  <td className="px-3 py-2"><button onClick={() => setModal({ mode: 'edit', record: row })} className="inline-flex items-center gap-1 rounded bg-slate-950 px-2 py-1 text-xs font-semibold text-white"><Eye size={13} /> View / Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal ? <FinishedGoodModal record={modal.record} onClose={() => setModal(null)} onSave={saveRecord} /> : null}
    </div>
  )
}
