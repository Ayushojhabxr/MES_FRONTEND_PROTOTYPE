import { getStatusClass } from '../../config/statusConfig'

export function StatusBadge({ status }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(status)}`}>{status}</span>
}
