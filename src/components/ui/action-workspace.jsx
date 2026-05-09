import { useEffect, useMemo, useState } from 'react'
import { StatusBadge } from '../badges/status-badge'

const names = ['Alpha Components', 'Prime Plastics', 'Nova Metals', 'Sigma Retail', 'Zenith Auto', 'Orbit Foods']
const owners = ['Ravi Patel', 'Aditi Sharma', 'Manoj Das', 'Priya Menon', 'Karan Singh', 'Nisha Rao']
const statuses = ['Draft', 'Pending', 'Approved', 'Completed', 'Blocked']

const hash = (text) => text.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

const buildRows = (key) => {
  const seed = hash(key)
  return Array.from({ length: 8 }).map((_, i) => {
    const qty = 100 + ((seed + i * 37) % 900)
    return {
      id: `${key.slice(0, 3).toUpperCase()}-${100 + i}`,
      ref: `${key.split('_')[1]?.slice(0, 3).toUpperCase() || 'REF'}-${400 + i}`,
      party: names[i % names.length],
      owner: owners[(i + seed) % owners.length],
      qty,
      amount: qty * (120 + ((seed + i * 23) % 300)),
      date: `2026-05-${String(11 + (i % 8)).padStart(2, '0')}`,
      status: statuses[(i + seed) % statuses.length],
      machine: `WC-${1 + ((seed + i) % 6)}`,
      shift: ['A', 'B', 'C'][(seed + i) % 3],
      vehicle: `MH12AB${3200 + i}`,
      challan: `CH-${7400 + i}`,
      invoice: `INV-${8800 + i}`,
      paymentDays: 7 + ((seed + i) % 45),
      defect: ['Color Variation', 'Weight Error', 'Seal Issue', 'Dimension Fail'][i % 4],
      warehouse: `WH-${1 + (i % 4)}`,
      location: `R-${2 + i}-B-${1 + (i % 3)}`,
    }
  })
}

const titleFromPath = (path) => path.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const scenarioByPath = (actionPath) => {
  const p = actionPath.toLowerCase()
  if (p === '/masters/permissions') return { kpis: ['Roles', 'Permission Sets', 'Pending Approval', 'Conflicts'], headers: ['Role', 'Module', 'Action', 'Scope', 'Updated By', 'Status'], row: (r) => [r.roleName || 'Production Manager', r.module || 'Production', r.action || 'Approve Plan', r.scope || 'Plant 1', r.owner, r.status], fields: [{ name: 'roleName', label: 'Role Name' }, { name: 'module', label: 'Module' }, { name: 'action', label: 'Permission Action' }, { name: 'scope', label: 'Scope' }, { name: 'owner', label: 'Updated By' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p === '/masters/settings') return { kpis: ['Configs', 'Enabled', 'Draft', 'Changed Today'], headers: ['Setting Key', 'Category', 'Value', 'Environment', 'Owner', 'Status'], row: (r) => [r.settingKey || r.ref, r.category || 'General', r.settingValue || 'Enabled', r.environment || 'Production', r.owner, r.status], fields: [{ name: 'settingKey', label: 'Setting Key' }, { name: 'category', label: 'Category' }, { name: 'settingValue', label: 'Value' }, { name: 'environment', label: 'Environment' }, { name: 'owner', label: 'Owner' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p === '/reports/audit-logs') return { kpis: ['Log Entries', 'Critical', 'Warnings', 'Resolved'], headers: ['Event ID', 'Entity', 'Event', 'User', 'Timestamp', 'Severity'], row: (r) => [r.eventId || r.ref, r.entity || 'User', r.eventType || 'Permission Update', r.owner, r.date, r.status], fields: [{ name: 'eventId', label: 'Event ID' }, { name: 'entity', label: 'Entity' }, { name: 'eventType', label: 'Event Type' }, { name: 'owner', label: 'User' }, { name: 'date', label: 'Timestamp' }, { name: 'status', label: 'Severity', type: 'status' }] }
  if (p.includes('/overview') || p.includes('/reports') || p.includes('/approvals')) return { kpis: ['Records', 'Open', 'Approved', 'Escalated'], headers: ['Reference', 'Department', 'Metric', 'Owner', 'Date', 'Status'], row: (r) => [r.ref, r.department || 'Operations', r.metric || 'KPI', r.owner, r.date, r.status], fields: [{ name: 'ref', label: 'Reference' }, { name: 'department', label: 'Department' }, { name: 'metric', label: 'Metric/Type' }, { name: 'owner', label: 'Owner' }, { name: 'date', label: 'Date' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/customers') || p.includes('/customer') || p.includes('/suppliers')) return { kpis: ['Accounts', 'Active', 'On Hold', 'New This Month'], headers: ['Account Code', 'Account Name', 'Type', 'Contact Person', 'GST/PAN', 'Status'], row: (r) => [r.accountCode || r.ref, r.accountName || r.party, r.accountType || 'Customer', r.contact || r.owner, r.taxId || '27AAAAA0000A1Z5', r.status], fields: [{ name: 'accountCode', label: 'Account Code' }, { name: 'accountName', label: 'Account Name' }, { name: 'accountType', label: 'Type (Customer/Supplier)' }, { name: 'contact', label: 'Contact Person' }, { name: 'taxId', label: 'GST/PAN' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/machines')) return { kpis: ['Machines', 'Running', 'Under Maintenance', 'Utilization %'], headers: ['Machine Code', 'Machine Name', 'Work Center', 'Capacity/Hr', 'Supervisor', 'Status'], row: (r) => [r.machineCode || r.machine, r.machineName || 'CNC-01', r.workCenter || 'WC-1', r.capacity || 120, r.owner, r.status], fields: [{ name: 'machineCode', label: 'Machine Code' }, { name: 'machineName', label: 'Machine Name' }, { name: 'workCenter', label: 'Work Center' }, { name: 'capacity', label: 'Capacity per Hour', type: 'number' }, { name: 'owner', label: 'Supervisor' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/bom')) return { kpis: ['BOMs', 'Approved', 'Revision Pending', 'Costed'], headers: ['BOM Code', 'Item', 'Revision', 'Yield %', 'Owner', 'Status'], row: (r) => [r.bomCode || r.ref, r.item || r.party, r.revision || 'R1', r.yield || 98, r.owner, r.status], fields: [{ name: 'bomCode', label: 'BOM Code' }, { name: 'item', label: 'Item' }, { name: 'revision', label: 'Revision' }, { name: 'yield', label: 'Yield %', type: 'number' }, { name: 'owner', label: 'Owner' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/planning') || p.includes('/plan-approvals')) return { kpis: ['Plans', 'Pending Approval', 'Approved', 'Released'], headers: ['Plan Ref', 'Date', 'Line', 'Target Qty', 'Planner', 'Status'], row: (r) => [r.ref, r.date, r.machine || 'Line-1', r.qty, r.owner, r.status], fields: [{ name: 'ref', label: 'Plan Ref' }, { name: 'date', label: 'Plan Date' }, { name: 'machine', label: 'Line/Work Center' }, { name: 'qty', label: 'Target Qty', type: 'number' }, { name: 'owner', label: 'Planner' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/orders')) return { kpis: ['Orders', 'Pending', 'In Progress', 'Closed'], headers: ['Order Ref', 'Customer/Item', 'Qty', 'Value', 'Owner', 'Status'], row: (r) => [r.ref, r.party, r.qty, `INR ${r.amount.toLocaleString()}`, r.owner, r.status], fields: [{ name: 'ref', label: 'Order Ref' }, { name: 'party', label: 'Customer/Item' }, { name: 'qty', label: 'Qty', type: 'number' }, { name: 'amount', label: 'Value', type: 'number' }, { name: 'owner', label: 'Owner' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/output') || p.includes('/downtime') || p.includes('/execution') || p.includes('/my-operations')) return { kpis: ['Operations', 'Running', 'Paused', 'Completed'], headers: ['Operation Ref', 'Machine', 'Shift', 'Output/Downtime', 'Operator', 'Status'], row: (r) => [r.ref, r.machine, r.shift, r.qty, r.owner, r.status], fields: [{ name: 'ref', label: 'Operation Ref' }, { name: 'machine', label: 'Machine' }, { name: 'shift', label: 'Shift' }, { name: 'qty', label: 'Output / Downtime Min', type: 'number' }, { name: 'owner', label: 'Operator' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/pending') || p.includes('/approved') || p.includes('/rejected') || p.includes('/rework') || p.includes('/checklist')) return { kpis: ['Lots', 'Pending', 'Approved', 'Rejected'], headers: ['Batch Ref', 'Item', 'Defect/Checklist', 'Inspector', 'Qty', 'Status'], row: (r) => [r.ref, r.party, r.defect, r.owner, r.qty, r.status], fields: [{ name: 'ref', label: 'Batch Ref' }, { name: 'party', label: 'Item' }, { name: 'defect', label: 'Defect/Checklist' }, { name: 'owner', label: 'Inspector' }, { name: 'qty', label: 'Qty', type: 'number' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/packing') || p.includes('/packaging') || p.includes('/packed') || p.includes('/move-fg')) return { kpis: ['Jobs', 'Pending', 'Packed', 'Moved to FG'], headers: ['Pack Ref', 'Material', 'Pack Type', 'Qty', 'Packer', 'Status'], row: (r) => [r.ref, r.party, r.packType || 'Carton', r.qty, r.owner, r.status], fields: [{ name: 'ref', label: 'Pack Ref' }, { name: 'party', label: 'Material/FG' }, { name: 'packType', label: 'Pack Type' }, { name: 'qty', label: 'Qty', type: 'number' }, { name: 'owner', label: 'Packer' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/ledger')) return { kpis: ['Entries', 'Debit', 'Credit', 'Balance'], headers: ['Ledger Ref', 'Account', 'Debit', 'Credit', 'Date', 'Status'], row: (r) => [r.ref, r.party, r.debit || r.amount, r.credit || 0, r.date, r.status], fields: [{ name: 'ref', label: 'Ledger Ref' }, { name: 'party', label: 'Account' }, { name: 'debit', label: 'Debit', type: 'number' }, { name: 'credit', label: 'Credit', type: 'number' }, { name: 'date', label: 'Date' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/payments') || p.includes('/receivables')) return { kpis: ['Records', 'Pending', 'Collected', 'Overdue'], headers: ['Payment Ref', 'Customer', 'Amount', 'Mode', 'Due Date', 'Status'], row: (r) => [r.ref, r.party, `INR ${r.amount.toLocaleString()}`, r.mode || 'Bank', r.date, r.status], fields: [{ name: 'ref', label: 'Payment Ref' }, { name: 'party', label: 'Customer' }, { name: 'amount', label: 'Amount', type: 'number' }, { name: 'mode', label: 'Payment Mode' }, { name: 'date', label: 'Due Date' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p === '/masters/users') return { kpis: ['Total Users', 'Active', 'Inactive', 'Locked'], headers: ['Employee Code', 'Full Name', 'Email', 'Role', 'Department', 'Status'], row: (r) => [r.empCode || r.ref, r.fullName || r.party, r.email || `${(r.party || '').toLowerCase().replace(/\s+/g, '.')}@aasa.in`, r.userRole || 'User', r.department || 'Operations', r.status], fields: [{ name: 'empCode', label: 'Employee Code' }, { name: 'fullName', label: 'Full Name' }, { name: 'email', label: 'Email' }, { name: 'userRole', label: 'Role' }, { name: 'department', label: 'Department' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p === '/masters/employees') return { kpis: ['Employees', 'Active', 'On Leave', 'Shifts'], headers: ['Emp ID', 'Name', 'Department', 'Designation', 'Shift', 'Status'], row: (r) => [r.empCode || r.ref, r.fullName || r.party, r.department || 'Production', r.designation || 'Executive', r.shift || 'A', r.status], fields: [{ name: 'empCode', label: 'Employee ID' }, { name: 'fullName', label: 'Employee Name' }, { name: 'department', label: 'Department' }, { name: 'designation', label: 'Designation' }, { name: 'shift', label: 'Shift' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p === '/masters/items') return { kpis: ['Items', 'FG', 'RM', 'Low Stock'], headers: ['Item Code', 'Item Name', 'Category', 'UOM', 'Std Cost', 'Status'], row: (r) => [r.itemCode || r.ref, r.itemName || r.party, r.category || 'Raw Material', r.uom || 'Kg', `INR ${r.amount.toLocaleString()}`, r.status], fields: [{ name: 'itemCode', label: 'Item Code' }, { name: 'itemName', label: 'Item Name' }, { name: 'category', label: 'Category' }, { name: 'uom', label: 'UOM' }, { name: 'amount', label: 'Std Cost', type: 'number' }, { name: 'status', label: 'Status', type: 'status' }] }
  if (p.includes('/dispatch/')) return { kpis: ['Ready Orders', 'Picked', 'Loaded', 'Delivered'], headers: ['Order Ref', 'Customer', 'Vehicle', 'Challan', 'Cases', 'Dispatch Status'], row: (r) => [r.ref, r.party, r.vehicle, r.challan, r.qty, r.status], fields: [{ name: 'ref', label: 'Order Ref' }, { name: 'party', label: 'Customer' }, { name: 'vehicle', label: 'Vehicle No' }, { name: 'challan', label: 'Challan No' }, { name: 'qty', label: 'Cases', type: 'number' }, { name: 'status', label: 'Dispatch Status', type: 'status' }] }
  if (p.includes('/billing/') || p.includes('/accounts/')) return { kpis: ['Pending Invoices', 'Sent', 'Paid', 'Overdue'], headers: ['Invoice', 'Customer', 'Amount', 'Due (Days)', 'Owner', 'Payment Status'], row: (r) => [r.invoice, r.party, `INR ${r.amount.toLocaleString()}`, r.paymentDays, r.owner, r.status], fields: [{ name: 'invoice', label: 'Invoice No' }, { name: 'party', label: 'Customer' }, { name: 'owner', label: 'Accounts Owner' }, { name: 'amount', label: 'Amount', type: 'number' }, { name: 'paymentDays', label: 'Due Days', type: 'number' }, { name: 'status', label: 'Payment Status', type: 'status' }] }
  if (p.includes('/qc/')) return { kpis: ['Pending Lots', 'Inspected', 'Rejected', 'Rework'], headers: ['Batch Ref', 'Item', 'Sample Qty', 'Defect', 'Inspector', 'QC Status'], row: (r) => [r.ref, r.party, r.qty, r.defect, r.owner, r.status], fields: [{ name: 'ref', label: 'Batch Ref' }, { name: 'party', label: 'Item' }, { name: 'defect', label: 'Defect Type' }, { name: 'owner', label: 'Inspector' }, { name: 'qty', label: 'Sample Qty', type: 'number' }, { name: 'status', label: 'QC Status', type: 'status' }] }
  if (p.includes('/production/')) return { kpis: ['Open Batches', 'Running', 'Completed', 'Blocked'], headers: ['Batch', 'Product', 'Machine', 'Shift', 'Output Qty', 'Execution Status'], row: (r) => [r.ref, r.party, r.machine, r.shift, r.qty, r.status], fields: [{ name: 'ref', label: 'Batch Ref' }, { name: 'party', label: 'Product' }, { name: 'machine', label: 'Machine' }, { name: 'shift', label: 'Shift' }, { name: 'qty', label: 'Output Qty', type: 'number' }, { name: 'status', label: 'Execution Status', type: 'status' }] }
  if (p.includes('/inventory/') || p.includes('/masters/warehouses')) return { kpis: ['Stock Lines', 'Reserved', 'Low Stock', 'Transfers'], headers: ['Item Ref', 'Warehouse', 'Location', 'Qty', 'Value', 'Stock Status'], row: (r) => [r.ref, r.warehouse, r.location, r.qty, `INR ${r.amount.toLocaleString()}`, r.status], fields: [{ name: 'ref', label: 'Item Ref' }, { name: 'warehouse', label: 'Warehouse' }, { name: 'location', label: 'Location Bin' }, { name: 'qty', label: 'Qty', type: 'number' }, { name: 'amount', label: 'Stock Value', type: 'number' }, { name: 'status', label: 'Stock Status', type: 'status' }] }
  if (p.includes('/sales/')) return { kpis: ['Open Orders', 'Confirmed', 'Ready Dispatch', 'Invoiced'], headers: ['SO Ref', 'Customer', 'Order Qty', 'Order Value', 'Sales Owner', 'Order Status'], row: (r) => [r.ref, r.party, r.qty, `INR ${r.amount.toLocaleString()}`, r.owner, r.status], fields: [{ name: 'ref', label: 'SO Ref' }, { name: 'party', label: 'Customer' }, { name: 'owner', label: 'Sales Owner' }, { name: 'qty', label: 'Order Qty', type: 'number' }, { name: 'amount', label: 'Order Value', type: 'number' }, { name: 'status', label: 'Order Status', type: 'status' }] }
  return { kpis: ['Open', 'Pending', 'Completed', 'Value'], headers: ['Ref', 'Party', 'Owner', 'Qty', 'Amount', 'Status'], row: (r) => [r.ref, r.party, r.owner, r.qty, `INR ${r.amount.toLocaleString()}`, r.status], fields: [{ name: 'ref', label: 'Ref' }, { name: 'party', label: 'Party' }, { name: 'owner', label: 'Owner' }, { name: 'qty', label: 'Qty', type: 'number' }, { name: 'amount', label: 'Amount', type: 'number' }, { name: 'status', label: 'Status', type: 'status' }] }
}

function CreateActionModal({ open, title, fields, onClose, onCreate }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const payload = {}
          fields.forEach((f) => {
            const val = fd.get(f.name)
            payload[f.name] = f.type === 'number' ? Number(val || 0) : val
          })
          onCreate(payload)
        }}
        className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="mb-4 text-lg font-semibold dark:text-slate-100">Create {title}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            f.type === 'status'
              ? <select key={f.name} name={f.name} className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"><option>Draft</option><option>Pending</option><option>Approved</option><option>Completed</option><option>Blocked</option></select>
              : <input key={f.name} name={f.name} type={f.type || 'text'} required placeholder={f.label} className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border px-3 py-2 dark:border-slate-600 dark:text-slate-100">Cancel</button><button className="rounded bg-slate-900 px-3 py-2 text-white dark:bg-sky-600">Create</button></div>
      </form>
    </div>
  )
}

function Header({ title, onCreate }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-indigo-50 to-cyan-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div><p className="text-sm text-slate-600 dark:text-slate-300">Home / {title}</p><h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1></div>
      <button onClick={onCreate} className="rounded-md bg-gradient-to-r from-sky-600 to-indigo-700 px-3 py-2 text-sm text-white">Create {title}</button>
    </div>
  )
}

function OpsTable({ rows, scenario, onView }) {
  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"><table className="min-w-full text-left text-sm"><thead className="bg-sky-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><tr>{scenario.headers.map((h) => <th key={h} className="px-4 py-3">{h}</th>)}<th className="px-4 py-3">Actions</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">{scenario.row(r).map((cell, idx) => <td key={`${r.id}-${idx}`} className={`px-4 py-3 ${idx === 0 ? 'font-semibold' : ''}`}>{idx === scenario.row(r).length - 1 ? <StatusBadge status={r.status} /> : cell}</td>)}<td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => onView(r)} className="rounded bg-slate-900 px-2 py-1 text-xs text-white dark:bg-sky-600">View</button><button className="rounded border px-2 py-1 text-xs dark:border-slate-600">Edit</button></div></td></tr>)}</tbody></table></div>
}

function ViewActionModal({ open, title, row, onClose }) {
  if (!open || !row) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-semibold dark:text-slate-100">{title} Detail</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(row).slice(0, 12).map(([k, v]) => <p key={k} className="text-sm dark:text-slate-200"><span className="font-semibold">{k}:</span> {String(v)}</p>)}
        </div>
        <div className="mt-4 flex justify-end"><button onClick={onClose} className="rounded border px-3 py-2 dark:border-slate-600 dark:text-slate-100">Close</button></div>
      </div>
    </div>
  )
}

function KanbanBoard({ rows }) {
  const cols = ['Pending', 'Approved', 'Completed']
  return <div className="grid gap-4 lg:grid-cols-3">{cols.map((c) => <div key={c} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"><p className="mb-2 text-sm font-semibold">{c}</p><div className="space-y-2">{rows.filter((r) => r.status === c).map((r) => <div key={r.id} className="rounded-md border border-slate-200 p-2 dark:border-slate-700"><p className="text-sm font-medium">{r.ref}</p><p className="text-xs text-slate-500 dark:text-slate-400">{r.party} • {r.owner}</p><p className="text-xs text-slate-500 dark:text-slate-400">Qty {r.qty}</p></div>)}</div></div>)}</div>
}

function TimelineView({ rows }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><p className="mb-3 text-sm font-semibold">Activity Timeline</p><div className="space-y-3">{rows.slice(0, 6).map((r) => <div key={r.id} className="flex gap-3"><div className="mt-1 h-2 w-2 rounded-full bg-slate-900" /><div><p className="text-sm font-medium">{r.ref} moved to {r.status}</p><p className="text-xs text-slate-500 dark:text-slate-400">{r.date} • by {r.owner} • {r.party}</p></div></div>)}</div></div>
}

function ChecklistView({ rows }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><p className="mb-3 text-sm font-semibold">Execution Checklist</p><div className="space-y-2">{rows.slice(0, 7).map((r, i) => <label key={r.id} className="flex items-center justify-between rounded-md border border-slate-200 p-2 text-sm dark:border-slate-700 dark:text-slate-200"><span>{i + 1}. {r.ref} - {r.party}</span><input type="checkbox" defaultChecked={r.status === 'Completed'} /></label>)}</div></div>
}

export function ActionWorkspace({ actionPath }) {
  const [q, setQ] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [viewRow, setViewRow] = useState(null)
  const title = useMemo(() => titleFromPath(actionPath), [actionPath])
  const key = useMemo(() => actionPath.replace(/^\//, '').replace(/\//g, '_').replace(/-/g, '_'), [actionPath])
  const [rows, setRows] = useState(() => buildRows(key))
  const scenario = useMemo(() => scenarioByPath(actionPath), [actionPath])
  const filtered = useMemo(() => rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase())), [rows, q])
  const mode = 0

  useEffect(() => { setRows(buildRows(key)) }, [key])

  return (
    <section className="space-y-4">
      <Header title={title} onCreate={() => setCreateOpen(true)} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800"><p className="text-sm text-slate-600 dark:text-slate-300">{scenario.kpis[0]}</p><p className="text-2xl font-semibold text-sky-700 dark:text-sky-300">{filtered.length}</p></div>
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800"><p className="text-sm text-slate-600 dark:text-slate-300">{scenario.kpis[1]}</p><p className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">{filtered.filter(r => r.status === 'Pending').length}</p></div>
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800"><p className="text-sm text-slate-600 dark:text-slate-300">{scenario.kpis[2]}</p><p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{filtered.filter(r => r.status === 'Completed').length}</p></div>
        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800"><p className="text-sm text-slate-600 dark:text-slate-300">{scenario.kpis[3]}</p><p className="text-2xl font-semibold text-amber-700 dark:text-amber-300">INR {filtered.reduce((a, b) => a + b.amount, 0).toLocaleString()}</p></div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search in ${title}...`} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" /></div>
      {mode === 0 && <OpsTable rows={filtered} scenario={scenario} onView={setViewRow} />}
      {mode === 1 && <KanbanBoard rows={filtered} />}
      {mode === 2 && <TimelineView rows={filtered} />}
      {mode === 3 && <ChecklistView rows={filtered} />}
      <CreateActionModal
        open={createOpen}
        title={title}
        fields={scenario.fields}
        onClose={() => setCreateOpen(false)}
        onCreate={(payload) => {
          setRows((prev) => [{
            ...buildRows(key)[0],
            ...payload,
            id: `${key.slice(0, 3).toUpperCase()}-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
          }, ...prev])
          setCreateOpen(false)
        }}
      />
      <ViewActionModal open={!!viewRow} title={title} row={viewRow} onClose={() => setViewRow(null)} />
    </section>
  )
}
