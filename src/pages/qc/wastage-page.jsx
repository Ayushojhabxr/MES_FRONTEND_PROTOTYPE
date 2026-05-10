import { useMemo, useState } from 'react'
import { AlertTriangle, Factory, IndianRupee, Plus, Recycle, Search, ShieldCheck } from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const stages = ['Cutting', 'Moulding', 'UV Coating', 'Packing', 'Quality', 'Dispatch']
const wasteTypes = ['Process Scrap', 'Rejection', 'Rework', 'Spillage', 'Trial Waste', 'Packing Damage']
const statuses = ['Reported', 'Reviewed', 'Approved', 'Recoverable', 'Rework', 'Disposed']

const seedWaste = [
  { id: 1, wasteNo: 'WST-260510-01', date: '2026-05-10', shift: '09:00-18:00', product: '100 ml Premium Perfume Bottle', bom: 'BOM-FG-PB-100', batch: 'B-260510-01', stage: 'Moulding', workCenter: 'Moulding Bay', material: 'PP granules', wasteType: 'Process Scrap', qty: 42, uom: 'kg', unitCost: 92, recoverableQty: 18, recoveryValue: 950, machine: 'IM-450T-01', operator: 'Ramesh Yadav', reason: 'Short shot during temperature stabilization', rootCause: 'Machine warm-up variation', responsibility: 'Process', action: 'First 20 minutes output isolated; setup checklist updated.', status: 'Reviewed', disposal: 'Scrap Store' },
  { id: 2, wasteNo: 'WST-260509-03', date: '2026-05-09', shift: '21:00-06:00', product: '24 mm Perfume Bottle Cap', bom: 'BOM-CAP-24', batch: 'B-260509-02', stage: 'UV Coating', workCenter: 'UV Section', material: 'Cap moulded part', wasteType: 'Rework', qty: 310, uom: 'pcs', unitCost: 8.04, recoverableQty: 240, recoveryValue: 0, machine: 'UV-COAT-01', operator: 'Iqbal Khan', reason: 'Uneven gloss after coating pass', rootCause: 'UV lamp intensity drift', responsibility: 'Machine', action: 'Lamp checked and parts sent to rework queue.', status: 'Rework', disposal: 'Rework Area' },
  { id: 3, wasteNo: 'WST-260508-02', date: '2026-05-08', shift: '09:00-18:00', product: 'Spray Pump Assembly', bom: 'BOM-PUMP-01', batch: 'B-260508-01', stage: 'Quality', workCenter: 'QC Bench', material: 'Spray pump', wasteType: 'Rejection', qty: 140, uom: 'pcs', unitCost: 11, recoverableQty: 0, recoveryValue: 0, machine: 'Not assigned', operator: 'Sunita Rao', reason: 'Leakage observed during pressure test', rootCause: 'Seal seating issue', responsibility: 'Supplier / Assembly', action: 'Batch blocked; supplier lot trace initiated.', status: 'Approved', disposal: 'Rejected Store' },
  { id: 4, wasteNo: 'WST-260507-01', date: '2026-05-07', shift: '09:30-18:30', product: 'Inner Mono Carton', bom: 'BOM-BOX-100', batch: 'B-260507-04', stage: 'Packing', workCenter: 'Packing Line 2', material: 'Mono carton', wasteType: 'Packing Damage', qty: 620, uom: 'pcs', unitCost: 3, recoverableQty: 0, recoveryValue: 450, machine: 'PKG-LINE-02', operator: 'Meena Sharma', reason: 'Carton corner crush during line transfer', rootCause: 'Conveyor guide misalignment', responsibility: 'Handling', action: 'Guide rail adjusted and damaged cartons sold as scrap.', status: 'Disposed', disposal: 'Sold as Scrap' },
]

const emptyDraft = {
  wasteNo: '',
  date: '2026-05-10',
  shift: '09:00-18:00',
  product: '',
  bom: '',
  batch: '',
  stage: 'Moulding',
  workCenter: '',
  material: '',
  wasteType: 'Process Scrap',
  qty: 0,
  uom: 'pcs',
  unitCost: 0,
  recoverableQty: 0,
  recoveryValue: 0,
  machine: '',
  operator: '',
  reason: '',
  rootCause: '',
  responsibility: 'Process',
  action: '',
  status: 'Reported',
  disposal: 'Scrap Store',
}

const currency = (value) => `INR ${Math.round(value || 0).toLocaleString('en-IN')}`
const number = (value) => Number(value || 0).toLocaleString('en-IN')
const wasteCost = (row) => Number(row.qty || 0) * Number(row.unitCost || 0)
const netLoss = (row) => Math.max(0, wasteCost(row) - Number(row.recoveryValue || 0))

function StatCard({ icon: Icon, label, value, tone = 'amber', sub }) {
  const tones = {
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-rose-200 bg-rose-50 text-rose-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600"><Icon size={14} />{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-950">{value}</div>
      {sub ? <div className="text-xs text-slate-500">{sub}</div> : null}
    </div>
  )
}

function WasteModal({ record, onClose, onSave }) {
  const [draft, setDraft] = useState(record || { ...emptyDraft, wasteNo: `WST-${Date.now().toString().slice(-6)}` })
  const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))
  const save = () => {
    const next = { ...draft, id: record?.id || Date.now() }
    ;['qty', 'unitCost', 'recoverableQty', 'recoveryValue'].forEach((key) => { next[key] = Number(next[key] || 0) })
    onSave(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-6xl rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{record ? 'Edit Waste Entry' : 'Add Waste Entry'}</h2>
            <p className="text-xs text-slate-500">Capture stage, material loss, cause, recovery, corrective action, and disposal.</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Cancel</button>
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-3">
          <section className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-sm font-semibold">Production Context</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Field label="Waste No." value={draft.wasteNo} onChange={(v) => update('wasteNo', v)} />
              <Field label="Date" type="date" value={draft.date} onChange={(v) => update('date', v)} />
              <Field label="Shift" value={draft.shift} onChange={(v) => update('shift', v)} />
              <Field label="Product" value={draft.product} onChange={(v) => update('product', v)} />
              <Field label="BOM" value={draft.bom} onChange={(v) => update('bom', v)} />
              <Field label="Batch" value={draft.batch} onChange={(v) => update('batch', v)} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-sm font-semibold">Stage & Waste</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <SelectField label="Stage / Phase" value={draft.stage} onChange={(v) => update('stage', v)} options={stages} />
              <Field label="Work Center" value={draft.workCenter} onChange={(v) => update('workCenter', v)} />
              <Field label="Material / Item" value={draft.material} onChange={(v) => update('material', v)} />
              <SelectField label="Waste Type" value={draft.wasteType} onChange={(v) => update('wasteType', v)} options={wasteTypes} />
              <div className="grid grid-cols-[1fr_90px] gap-2">
                <Field label="Quantity" type="number" value={draft.qty} onChange={(v) => update('qty', v)} />
                <SelectField label="UoM" value={draft.uom} onChange={(v) => update('uom', v)} options={['pcs', 'kg', 'ltr', 'meter']} />
              </div>
              <Field label="Unit Cost" type="number" value={draft.unitCost} onChange={(v) => update('unitCost', v)} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-sm font-semibold">Cause, Recovery & Closure</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Field label="Machine" value={draft.machine} onChange={(v) => update('machine', v)} />
              <Field label="Operator" value={draft.operator} onChange={(v) => update('operator', v)} />
              <SelectField label="Responsibility" value={draft.responsibility} onChange={(v) => update('responsibility', v)} options={['Process', 'Machine', 'Material', 'Operator', 'Supplier / Assembly', 'Handling']} />
              <Field label="Recoverable Qty" type="number" value={draft.recoverableQty} onChange={(v) => update('recoverableQty', v)} />
              <Field label="Recovery Value" type="number" value={draft.recoveryValue} onChange={(v) => update('recoveryValue', v)} />
              <SelectField label="Status" value={draft.status} onChange={(v) => update('status', v)} options={statuses} />
              <SelectField label="Disposal Location" value={draft.disposal} onChange={(v) => update('disposal', v)} options={['Scrap Store', 'Rejected Store', 'Rework Area', 'Sold as Scrap', 'Disposed']} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-3 lg:col-span-3">
            <div className="grid gap-3 lg:grid-cols-3">
              <TextArea label="Reason / How it happened" value={draft.reason} onChange={(v) => update('reason', v)} />
              <TextArea label="Root Cause" value={draft.rootCause} onChange={(v) => update('rootCause', v)} />
              <TextArea label="Corrective Action" value={draft.action} onChange={(v) => update('action', v)} />
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <div className="text-sm text-slate-600">Waste cost <strong className="text-slate-950">{currency(wasteCost(draft))}</strong> · Net loss <strong className="text-rose-700">{currency(netLoss(draft))}</strong></div>
          <button onClick={save} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save Waste Entry</button>
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

function TextArea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase text-slate-500">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400" />
    </label>
  )
}

export default function WastagePage() {
  const [records, setRecords] = useState(seedWaste)
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('All')
  const [type, setType] = useState('All')
  const [modal, setModal] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return records.filter((row) => {
      const haystack = [row.wasteNo, row.product, row.bom, row.batch, row.stage, row.workCenter, row.material, row.machine, row.operator, row.reason].join(' ').toLowerCase()
      return (!q || haystack.includes(q)) && (stage === 'All' || row.stage === stage) && (type === 'All' || row.wasteType === type)
    })
  }, [records, search, stage, type])

  const totals = useMemo(() => records.reduce((acc, row) => {
    acc.qty += Number(row.qty || 0)
    acc.cost += wasteCost(row)
    acc.recovery += Number(row.recoveryValue || 0)
    acc.loss += netLoss(row)
    if (row.status === 'Rework') acc.rework += 1
    return acc
  }, { qty: 0, cost: 0, recovery: 0, loss: 0, rework: 0 }), [records])

  const topStage = useMemo(() => {
    const counts = records.reduce((acc, row) => ({ ...acc, [row.stage]: (acc[row.stage] || 0) + wasteCost(row) }), {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
  }, [records])

  const saveRecord = (record) => {
    setRecords((prev) => prev.some((row) => row.id === record.id) ? prev.map((row) => row.id === record.id ? record : row) : [record, ...prev])
    setModal(null)
  }

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Production / Waste Management</p>
            <h1 className="text-2xl font-semibold text-slate-950">Waste, Scrap & Rework</h1>
            <p className="text-sm text-slate-600">Stage-wise loss control with material, machine, operator, cause, cost, recovery, and closure status.</p>
          </div>
          <button onClick={() => setModal({ mode: 'create' })} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Add Waste Entry</button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={AlertTriangle} label="Waste Qty" value={number(totals.qty)} sub="Mixed UoM entries" />
        <StatCard icon={IndianRupee} label="Waste Cost" value={currency(totals.cost)} tone="red" sub="Gross production loss" />
        <StatCard icon={Recycle} label="Recovery" value={currency(totals.recovery)} tone="green" sub="Scrap sale / reusable value" />
        <StatCard icon={ShieldCheck} label="Net Loss" value={currency(totals.loss)} tone="red" sub={`${totals.rework} rework batches`} />
        <StatCard icon={Factory} label="Highest Loss Stage" value={topStage} tone="blue" sub="By cost impact" />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search waste no, product, stage, machine, operator, reason..." className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-sky-400" />
          </div>
          <select value={stage} onChange={(event) => setStage(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
            {['All', ...stages].map((option) => <option key={option}>{option}</option>)}
          </select>
          <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
            {['All', ...wasteTypes].map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1420px] w-full text-left text-sm">
            <thead className="bg-amber-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2">Waste / Date</th>
                <th className="px-3 py-2">Product / BOM</th>
                <th className="px-3 py-2">Stage / Work Center</th>
                <th className="px-3 py-2">Material / Type</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Machine / Operator</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Cost / Recovery</th>
                <th className="px-3 py-2">Net Loss</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2 font-semibold text-slate-950">{row.wasteNo}<div className="text-xs font-normal text-slate-500">{row.date} · {row.shift}</div></td>
                  <td className="px-3 py-2">{row.product}<div className="text-xs text-slate-500">{row.bom} / {row.batch}</div></td>
                  <td className="px-3 py-2 font-medium">{row.stage}<div className="text-xs text-slate-500">{row.workCenter}</div></td>
                  <td className="px-3 py-2">{row.material}<div className="text-xs text-slate-500">{row.wasteType}</div></td>
                  <td className="px-3 py-2">{number(row.qty)} {row.uom}<div className="text-xs text-slate-500">Recoverable {number(row.recoverableQty)}</div></td>
                  <td className="px-3 py-2">{row.machine}<div className="text-xs text-slate-500">{row.operator}</div></td>
                  <td className="max-w-[260px] px-3 py-2">{row.reason}<div className="text-xs text-slate-500">{row.rootCause}</div></td>
                  <td className="px-3 py-2">{currency(wasteCost(row))}<div className="text-xs text-emerald-700">Recovery {currency(row.recoveryValue)}</div></td>
                  <td className="px-3 py-2 font-semibold text-rose-700">{currency(netLoss(row))}</td>
                  <td className="px-3 py-2"><StatusBadge status={row.status} /><div className="mt-1 text-xs text-slate-500">{row.disposal}</div></td>
                  <td className="px-3 py-2"><button onClick={() => setModal({ mode: 'edit', record: row })} className="rounded bg-slate-950 px-2 py-1 text-xs font-semibold text-white">View / Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal ? <WasteModal record={modal.record} onClose={() => setModal(null)} onSave={saveRecord} /> : null}
    </div>
  )
}
