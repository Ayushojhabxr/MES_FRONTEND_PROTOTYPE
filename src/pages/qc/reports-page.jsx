import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BadgeX,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  IndianRupee,
  RotateCcw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const inr = (value) => `INR ${value.toLocaleString('en-IN')}`

const qcFailures = [
  {
    report: 'QC-1007',
    batch: 'B-100-243',
    product: '100 ml Premium Perfume Bottle',
    customer: 'Luxury Scents Co.',
    inspected: 560,
    passed: 418,
    rejected: 92,
    rework: 50,
    scrap: 42,
    loss: 3864,
    unitCost: 92,
    defectRate: 25,
    reason: 'Cap fitment loose after crimping',
    rootCause: 'Crimping pressure was set lower than recipe spec and metal cap lot had diameter variation.',
    failedAt: 'Cap fitting / crimping',
    owner: 'Line 1 Supervisor',
    supplier: 'Metro Caps Vendor',
    status: 'Blocked',
    action: 'Hold metal cap lot MC-24-77, recalibrate crimping head, inspect next 200 units before release.',
    checks: [
      { point: 'Cap pull test', expected: '>= 18 N', actual: '11-14 N', result: 'Fail' },
      { point: 'Visual dent check', expected: 'No dent', actual: 'Pass', result: 'Pass' },
      { point: 'Leak test', expected: 'No leakage', actual: '3.2% leakage', result: 'Fail' },
    ],
  },
  {
    report: 'QC-1008',
    batch: 'B-030-308',
    product: '30 ml Travel Bottle Body',
    customer: 'Sigma Scents',
    inspected: 700,
    passed: 642,
    rejected: 18,
    rework: 40,
    scrap: 18,
    loss: 432,
    unitCost: 24,
    defectRate: 8,
    reason: 'Scratch marks on glass tube body',
    rootCause: 'Conveyor guide rail was rubbing on the glass body during transfer to final inspection.',
    failedAt: 'Final inspection',
    owner: 'Maintenance + QC',
    supplier: 'Internal process',
    status: 'Pending',
    action: 'Replace guide rail liner, rework 40 units by polishing, scrap 18 units with deep scratch.',
    checks: [
      { point: 'Surface scratch', expected: 'No visible scratch', actual: '58 units marked', result: 'Fail' },
      { point: 'Dimension check', expected: '+/- 0.2 mm', actual: 'Within limit', result: 'Pass' },
      { point: 'Neck finish', expected: 'No chip', actual: 'Pass', result: 'Pass' },
    ],
  },
  {
    report: 'QC-1009',
    batch: 'B-050-198',
    product: '50 ml Classic Perfume Bottle',
    customer: 'Prime Fragrance',
    inspected: 480,
    passed: 451,
    rejected: 9,
    rework: 20,
    scrap: 9,
    loss: 522,
    unitCost: 58,
    defectRate: 6,
    reason: 'Label alignment out of tolerance',
    rootCause: 'Label roll edge sensor drifted by 2.5 mm after changeover.',
    failedAt: 'Labeling',
    owner: 'Packaging Operator',
    supplier: 'Internal process',
    status: 'Approved',
    action: 'Reset label sensor, rework 20 bottles, add first-off approval after every roll change.',
    checks: [
      { point: 'Front label alignment', expected: '+/- 1 mm', actual: '+2.5 mm', result: 'Fail' },
      { point: 'Barcode scan', expected: 'Readable', actual: 'Pass', result: 'Pass' },
      { point: 'Carton print match', expected: 'Same SKU', actual: 'Pass', result: 'Pass' },
    ],
  },
  {
    report: 'QC-1010',
    batch: 'B-CAP-072',
    product: '24 mm Perfume Bottle Cap',
    customer: 'Nova Aromatics',
    inspected: 900,
    passed: 690,
    rejected: 146,
    rework: 64,
    scrap: 146,
    loss: 1752,
    unitCost: 12,
    defectRate: 23,
    reason: 'Sink marks and uneven metalized sleeve',
    rootCause: 'PP granule moisture was above limit and sleeve heating temperature fluctuated.',
    failedAt: 'Moulding + sleeve fitment',
    owner: 'Moulding Supervisor',
    supplier: 'Raw material lot PP-18-42',
    status: 'Blocked',
    action: 'Quarantine PP lot, dry granules before moulding, validate sleeve heater PID before restart.',
    checks: [
      { point: 'Sink mark visual', expected: 'No sink mark', actual: '13% failed', result: 'Fail' },
      { point: 'Sleeve adhesion', expected: 'No peel', actual: '7% peel', result: 'Fail' },
      { point: 'Fitment with bottle neck', expected: 'Smooth fit', actual: 'Pass', result: 'Pass' },
    ],
  },
]

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

function QcModal({ record, onClose }) {
  if (!record) return null
  const recoveredValue = record.rework * record.unitCost
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{record.report} / {record.batch}</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{record.product}</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 dark:border-slate-700 dark:text-slate-100" aria-label="Close detail">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Rejected qty" value={record.rejected.toLocaleString('en-IN')} note={`${record.defectRate}% defect rate`} icon={BadgeX} tone="red" />
            <MetricCard label="Rework qty" value={record.rework.toLocaleString('en-IN')} note={`${inr(recoveredValue)} recoverable`} icon={RotateCcw} tone="amber" />
            <MetricCard label="Scrap qty" value={record.scrap.toLocaleString('en-IN')} note="Permanent loss units" icon={AlertTriangle} tone="red" />
            <MetricCard label="Loss amount" value={inr(record.loss)} note={`${inr(record.unitCost)} unit cost`} icon={IndianRupee} tone="red" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Why quality failed</h3>
              <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p><span className="font-semibold text-slate-900 dark:text-slate-100">Reason:</span> {record.reason}</p>
                <p><span className="font-semibold text-slate-900 dark:text-slate-100">Root cause:</span> {record.rootCause}</p>
                <p><span className="font-semibold text-slate-900 dark:text-slate-100">Failed at:</span> {record.failedAt}</p>
                <p><span className="font-semibold text-slate-900 dark:text-slate-100">Owner:</span> {record.owner}</p>
                <p><span className="font-semibold text-slate-900 dark:text-slate-100">Source:</span> {record.supplier}</p>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Corrective action</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{record.action}</p>
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800 dark:text-slate-200">
                CEO view: {record.rejected.toLocaleString('en-IN')} units failed, {record.scrap.toLocaleString('en-IN')} scrap units created direct loss of {inr(record.loss)}. {record.rework.toLocaleString('en-IN')} units can still be recovered through rework.
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Inspection checklist result</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <tr><th className="px-4 py-3">Check point</th><th>Expected</th><th>Actual</th><th>Result</th></tr>
                </thead>
                <tbody>
                  {record.checks.map((check) => (
                    <tr key={check.point} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{check.point}</td>
                      <td>{check.expected}</td>
                      <td>{check.actual}</td>
                      <td><StatusBadge status={check.result === 'Pass' ? 'Approved' : 'Blocked'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function QcReportsPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return qcFailures.filter((record) => {
      const statusMatch = status === 'All' || record.status === status
      const queryMatch = !needle || JSON.stringify(record).toLowerCase().includes(needle)
      return statusMatch && queryMatch
    })
  }, [query, status])

  const totals = useMemo(() => ({
    inspected: qcFailures.reduce((sum, item) => sum + item.inspected, 0),
    rejected: qcFailures.reduce((sum, item) => sum + item.rejected, 0),
    rework: qcFailures.reduce((sum, item) => sum + item.rework, 0),
    loss: qcFailures.reduce((sum, item) => sum + item.loss, 0),
    blocked: qcFailures.filter((item) => item.status === 'Blocked').length,
  }), [])
  const passRate = Math.round(((totals.inspected - totals.rejected) / totals.inspected) * 100)

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Home / QC & Rejection Report</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">CEO Quality Failure Tracking</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Track failed products, failure reasons, root cause, rejected quantity, rework, scrap, and loss amount.</p>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800 dark:text-slate-100">
            Quality loss: <span className="font-semibold text-rose-700 dark:text-rose-300">{inr(totals.loss)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Inspected units" value={totals.inspected.toLocaleString('en-IN')} note={`${passRate}% pass rate`} icon={ClipboardCheck} tone="blue" />
        <MetricCard label="Rejected units" value={totals.rejected.toLocaleString('en-IN')} note="Failed QC checks" icon={BadgeX} tone="red" />
        <MetricCard label="Rework units" value={totals.rework.toLocaleString('en-IN')} note="Recoverable after action" icon={RotateCcw} tone="amber" />
        <MetricCard label="Loss amount" value={inr(totals.loss)} note="Scrap + rejection cost" icon={IndianRupee} tone="red" />
        <MetricCard label="Blocked batches" value={totals.blocked} note="CEO attention" icon={ShieldAlert} tone="red" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search product, batch, failure reason, owner, supplier..."
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option>All</option>
            <option>Blocked</option>
            <option>Pending</option>
            <option>Approved</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Batch / product</th>
                <th>Failed reason</th>
                <th>Rejected</th>
                <th>Rework</th>
                <th>Scrap</th>
                <th>Loss</th>
                <th>Owner</th>
                <th>Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.report} onClick={() => setSelected(record)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{record.batch}</p>
                    <p className="text-xs text-slate-500">{record.product}</p>
                  </td>
                  <td>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{record.reason}</p>
                    <p className="text-xs text-slate-500">{record.failedAt}</p>
                  </td>
                  <td className="font-semibold text-rose-700 dark:text-rose-300">{record.rejected.toLocaleString('en-IN')}</td>
                  <td>{record.rework.toLocaleString('en-IN')}</td>
                  <td>{record.scrap.toLocaleString('en-IN')}</td>
                  <td className="font-semibold text-rose-700 dark:text-rose-300">{inr(record.loss)}</td>
                  <td>{record.owner}</td>
                  <td><StatusBadge status={record.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={(event) => { event.stopPropagation(); setSelected(record) }} className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-sky-600">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Top failure reasons</p>
          <div className="mt-3 space-y-2 text-sm">
            {qcFailures.slice(0, 3).map((record) => (
              <button key={record.report} onClick={() => setSelected(record)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <span>
                  <span className="block font-medium text-slate-800 dark:text-slate-100">{record.reason}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{record.product}</span>
                </span>
                <span className="font-semibold text-rose-700 dark:text-rose-300">{inr(record.loss)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">CEO quality summary</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Highest loss</p>
              <p className="mt-1 text-lg font-semibold text-rose-700 dark:text-rose-300">Cap fitment loose</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Supplier risk</p>
              <p className="mt-1 text-lg font-semibold text-amber-700 dark:text-amber-300">Metro Caps + PP lot</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Immediate action</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">Hold failed lots</p>
            </div>
          </div>
        </div>
      </div>

      <QcModal record={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
