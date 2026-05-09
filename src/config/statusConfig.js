export const statusConfig = {
  Draft: 'bg-slate-100 text-slate-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
  Pending: 'bg-amber-100 text-amber-700',
  Closed: 'bg-zinc-200 text-zinc-700',
  Running: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Blocked: 'bg-rose-100 text-rose-700',
  Dispatched: 'bg-cyan-100 text-cyan-700',
  Paid: 'bg-green-100 text-green-700',
  Overdue: 'bg-red-100 text-red-700',
}

export const getStatusClass = (status) => statusConfig[status] || 'bg-slate-100 text-slate-700'
