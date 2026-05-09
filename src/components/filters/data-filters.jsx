export function DataFilters({ query, status, onQuery, onStatus }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:flex-row">
      <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search..." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
      <select value={status} onChange={(e) => onStatus(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
        <option value="All">All Status</option>
        <option>Draft</option><option>Pending</option><option>Approved</option><option>Completed</option><option>Blocked</option>
      </select>
      <input type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
    </div>
  )
}
