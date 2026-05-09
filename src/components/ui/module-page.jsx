import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataFilters } from '../filters/data-filters'
import { KpiCards } from '../cards/kpi-cards'
import { DataTable } from '../tables/data-table'
import { DetailModal } from '../modals/detail-modal'
import { getRowsForKey } from '../../data/mockData'

function CreateRecordModal({ open, title, onClose, onCreate }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          onCreate({
            code: fd.get('code'),
            name: fd.get('name'),
            owner: fd.get('owner'),
            qty: Number(fd.get('qty') || 0),
            value: Number(fd.get('value') || 0),
            status: fd.get('status'),
          })
        }}
        className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="mb-4 text-lg font-semibold dark:text-slate-100">Create {title}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="code" required placeholder="Code" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="name" required placeholder="Name" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="owner" required placeholder="Owner" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="qty" type="number" required placeholder="Qty" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="value" type="number" required placeholder="Value" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <select name="status" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <option>Draft</option><option>Pending</option><option>Approved</option><option>Completed</option><option>Blocked</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border px-3 py-2 dark:border-slate-600 dark:text-slate-100">Cancel</button>
          <button className="rounded bg-slate-900 px-3 py-2 text-white dark:bg-sky-600">Create</button>
        </div>
      </form>
    </div>
  )
}

export function ModulePage({ title, dataKey, showApprove = false, allowEdit = true, canCreate = true }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [rows, setRows] = useState(() => getRowsForKey(dataKey || title.toLowerCase().replace(/\s+/g, '_')))
  const navigate = useNavigate()

  const filtered = useMemo(
    () => rows.filter((r) => (status === 'All' || r.status === status) && JSON.stringify(r).toLowerCase().includes(query.toLowerCase())),
    [rows, query, status],
  )

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between"><div><p className="text-sm text-slate-500 dark:text-slate-400">Home / {title}</p><h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1></div>{canCreate && <button onClick={() => setCreateOpen(true)} className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white dark:bg-sky-600">Create {title}</button>}</div>
      <KpiCards items={[{ label: 'Total Records', value: String(rows.length), change: `${dataKey} dataset` }, { label: 'Pending', value: String(rows.filter(r=>r.status==='Pending').length), change: 'Requires action' }, { label: 'Completed', value: String(rows.filter(r=>r.status==='Completed').length), change: 'Cycle done' }, { label: 'Value', value: `INR ${rows.reduce((a,b)=>a+b.value,0).toLocaleString()}`, change: 'Combined' }]} />
      <DataFilters query={query} status={status} onQuery={setQuery} onStatus={setStatus} />
      <DataTable rows={filtered} onView={setSelected} allowEdit={allowEdit} allowApprove={showApprove} />
      <DetailModal open={!!selected} onClose={() => setSelected(null)} record={selected} title={title} />
      <CreateRecordModal
        open={createOpen}
        title={title}
        onClose={() => setCreateOpen(false)}
        onCreate={(payload) => {
          setRows((prev) => [{
            ...payload,
            plant: 'Plant 1',
            date: new Date().toISOString().slice(0, 10),
          }, ...prev])
          setCreateOpen(false)
        }}
      />
      <div className="flex gap-2"><button onClick={() => navigate(-1)} className="rounded border px-3 py-1 text-sm dark:border-slate-600 dark:text-slate-100">Back</button></div>
    </section>
  )
}
