import { ROLES } from '../config/rolePermissions'

export const users = [
  { id: 'U001', name: 'Aman Verma', email: 'aman@aasa.in', role: ROLES.ADMIN, status: 'Active' },
  { id: 'U002', name: 'Nisha Rao', email: 'nisha@aasa.in', role: ROLES.CEO, status: 'Active' },
  { id: 'U003', name: 'Karan Singh', email: 'karan@aasa.in', role: ROLES.SALES, status: 'Active' },
]

const baseNames = ['Alpha Components', 'Prime Plastics', 'Nova Metals', 'Sigma Retail', 'Zenith Auto']
const baseOwners = ['Karan Singh', 'Ravi Patel', 'Aditi Sharma', 'Manoj Das', 'Priya Menon']
const statuses = ['Draft', 'Pending', 'Approved', 'Completed', 'Blocked']

const hash = (text) => text.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

export const getRowsForKey = (key) => {
  const seed = hash(key)
  const prefix = key.slice(0, 3).toUpperCase()
  return baseNames.map((name, i) => {
    const qty = 500 + ((seed + i * 137) % 1400)
    const value = qty * (180 + ((seed + i * 19) % 420))
    return {
      code: `${prefix}-${1000 + ((seed + i * 7) % 9000)}`,
      name: `${name} - ${key.replace(/_/g, ' ').slice(0, 18)}`,
      plant: `Plant ${1 + ((seed + i) % 3)}`,
      owner: baseOwners[(seed + i) % baseOwners.length],
      qty,
      value,
      date: `2026-05-0${5 + ((i + seed) % 5)}`,
      status: statuses[(seed + i) % statuses.length],
    }
  })
}

export const dashboardData = {
  [ROLES.ADMIN]: { kpis: [{ label: 'Total users', value: '245', change: '+12 monthly' }, { label: 'Active employees', value: '1,184', change: '96.2% active' }, { label: 'Master setup', value: '31 / 37', change: '6 pending' }, { label: 'Audit alerts', value: '8', change: '2 critical' }] },
  [ROLES.CEO]: { kpis: [{ label: 'Total orders', value: '3,482', change: '+4.8% WoW' }, { label: 'Pending production', value: '182', change: '42 critical' }, { label: 'Revenue', value: 'INR 8.4 Cr', change: '+9.2% MoM' }, { label: 'Profitability', value: '18.4%', change: '+1.2 pts' }] },
  [ROLES.SALES]: { kpis: [{ label: 'Sales orders', value: '904', change: '+37 this week' }, { label: 'Need production', value: '122', change: 'priority 34' }, { label: 'Ready dispatch', value: '88', change: 'same day 41' }, { label: 'Invoiced', value: '612', change: '68% conversion' }] },
  [ROLES.PRODUCTION_MANAGER]: { kpis: [{ label: 'Open requirements', value: '142', change: '18 urgent' }, { label: 'Today plans', value: '64', change: '7 pending approval' }, { label: 'Active batches', value: '51', change: '5 delayed' }, { label: 'Machine load', value: '83%', change: '+3% today' }] },
  [ROLES.STOCK_MANAGER]: { kpis: [{ label: 'Raw stock items', value: '1,982', change: 'safe level 92%' }, { label: 'Reserved stock', value: '384', change: 'for 71 orders' }, { label: 'Low stock', value: '46', change: '11 critical' }, { label: 'Pending issues', value: '27', change: 'today 9' }] },
  [ROLES.SUPERVISOR]: { kpis: [{ label: 'Assigned batches', value: '22', change: 'current shift' }, { label: 'Running ops', value: '11', change: 'steady' }, { label: 'Downtime entries', value: '4', change: '2 escalated' }, { label: 'Output today', value: '18,420', change: 'units' }] },
  [ROLES.OPERATOR]: { kpis: [{ label: 'My tasks', value: '9', change: '5 in queue' }, { label: 'Running op', value: '1', change: 'line P2' }, { label: 'Output today', value: '1,260', change: 'units' }, { label: 'Downtime logged', value: '32 min', change: 'within target' }] },
  [ROLES.QC]: { kpis: [{ label: 'Pending QC', value: '38', change: '13 high priority' }, { label: 'In inspection', value: '12', change: 'ongoing' }, { label: 'Rejected qty', value: '1.8%', change: '-0.3%' }, { label: 'Rework qty', value: '2.4%', change: '+0.2%' }] },
  [ROLES.PACKAGING]: { kpis: [{ label: 'Pending packing', value: '29', change: 'rush 6' }, { label: 'Packed today', value: '74', change: '+11 vs yesterday' }, { label: 'PM shortage', value: '7', change: 'critical 2' }, { label: 'FG moved', value: '61', change: 'jobs closed' }] },
  [ROLES.DISPATCH]: { kpis: [{ label: 'Ready dispatch', value: '43', change: 'today' }, { label: 'Picked', value: '31', change: '72%' }, { label: 'In transit', value: '18', change: 'on time 94%' }, { label: 'Delivered today', value: '27', change: '+4' }] },
  [ROLES.ACCOUNTS]: { kpis: [{ label: 'Pending invoices', value: '57', change: 'priority 12' }, { label: 'Sent invoices', value: '311', change: 'MTD' }, { label: 'Paid', value: 'INR 3.2 Cr', change: 'collection 86%' }, { label: 'Overdue', value: 'INR 48 L', change: '21 accounts' }] },
}
