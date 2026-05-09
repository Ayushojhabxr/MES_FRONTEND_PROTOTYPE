import { X } from 'lucide-react'
import { StatusBadge } from '../badges/status-badge'

export function DetailModal({ open, onClose, record, title }) {
  if (!open || !record) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between"><div><h3 className="text-lg font-semibold">{title} Detail</h3><p className="text-sm text-slate-500">{record.code}</p></div><button onClick={onClose}><X size={18} /></button></div>
        <div className="grid gap-3 md:grid-cols-2"><p><b>Name:</b> {record.name}</p><p><b>Owner:</b> {record.owner}</p><p><b>Plant:</b> {record.plant}</p><p><b>Date:</b> {record.date}</p><p><b>Quantity:</b> {record.qty}</p><p><b>Value:</b> ?{record.value.toLocaleString()}</p></div>
        <div className="mt-4"><p className="mb-2 text-sm font-semibold">Status Timeline</p><div className="flex gap-2"><StatusBadge status="Draft" /><StatusBadge status="Pending" /><StatusBadge status={record.status} /></div></div>
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm"><p className="font-semibold">Audit Trail</p><p>Created by {record.owner} on {record.date}. Last updated by System at 18:20.</p></div>
      </div>
    </div>
  )
}
