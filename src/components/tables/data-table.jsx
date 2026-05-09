import { StatusBadge } from '../badges/status-badge'

export function DataTable({ rows, onView, allowEdit = true, allowApprove = false }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><tr><th className="px-4 py-3">Code</th><th>Name</th><th>Owner</th><th>Qty</th><th>Value</th><th>Status</th><th className="px-4 py-3">Actions</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
              <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{row.code}</td><td>{row.name}</td><td>{row.owner}</td><td>{row.qty}</td><td>INR {row.value.toLocaleString()}</td><td><StatusBadge status={row.status} /></td>
              <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => onView(row)} className="rounded bg-slate-900 px-2 py-1 text-xs text-white dark:bg-sky-600">View</button>{allowEdit && <button className="rounded border px-2 py-1 text-xs dark:border-slate-600 dark:text-slate-100">Edit</button>}{allowApprove && <><button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">Approve</button><button className="rounded bg-red-600 px-2 py-1 text-xs text-white">Reject</button></>}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
