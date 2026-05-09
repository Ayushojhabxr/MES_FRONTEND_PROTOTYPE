import { ROLES } from '../config/rolePermissions'
import { sidebarConfig } from '../config/sidebarConfig'

const permissionByArea = {
  masters: 'master:admin',
  sales: 'sales:view',
  production: 'production:view',
  inventory: 'inventory:view',
  qc: 'qc:view',
  packaging: 'packaging:view',
  dispatch: 'dispatch:view',
  billing: 'billing:view',
  reports: 'report:view',
}

const specialPermissions = {
  '/production/execution': 'production:execute',
  '/inventory/issue': 'inventory:edit',
  '/dispatch/planning': 'dispatch:edit',
  '/billing/invoices': 'billing:edit',
}

const explicitModules = [
  { path: '/masters/users', title: 'User Management' },
  { path: '/masters/permissions', title: 'Role Permission Matrix' },
  { path: '/masters/employees', title: 'Employee Master' },
  { path: '/masters/customers-suppliers', title: 'Customer / Supplier Master' },
  { path: '/masters/items', title: 'Item Master' },
  { path: '/masters/warehouses', title: 'Warehouse / Location' },
  { path: '/masters/machines', title: 'Machine / Work Center' },
  { path: '/production/bom', title: 'BOM / Recipe Management' },
  { path: '/sales/orders', title: 'Sales Order' },
  { path: '/production/requirements', title: 'Production Requirement' },
  { path: '/production/planning', title: 'Daily Production Planning' },
  { path: '/production/orders', title: 'Production Order / Batch' },
  { path: '/inventory/issue', title: 'Material Reservation & Issue' },
  { path: '/production/execution', title: 'Production Execution' },
  { path: '/qc/inspection', title: 'QC Inspection' },
  { path: '/qc/wastage', title: 'Wastage / Scrap / Rework' },
  { path: '/packaging/entry', title: 'Packaging Management' },
  { path: '/inventory/finished-goods', title: 'Finished Goods Inventory' },
  { path: '/dispatch/planning', title: 'Dispatch Management' },
  { path: '/billing/invoices', title: 'Billing / Invoice / Payment' },
  { path: '/inventory/ledger', title: 'Inventory Ledger' },
  { path: '/reports/costing', title: 'Production Costing' },
  { path: '/reports/all', title: 'Reports' },
  { path: '/reports/audit-logs', title: 'Audit Logs' },
]

const explicitMap = Object.fromEntries(explicitModules.map((m) => [m.path, m.title]))

const allSidebarItems = Object.values(sidebarConfig).flat().filter((item) => !item.path.startsWith('/dashboard/'))
const uniqueItems = Array.from(new Map(allSidebarItems.map((item) => [item.path, item])).values())

const slugToKey = (path) => path.replace(/^\//, '').replace(/\//g, '_').replace(/-/g, '_')
const fallbackTitle = (path) => path.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const modules = uniqueItems.map((item) => {
  const area = item.path.split('/')[1]
  return {
    path: item.path,
    title: explicitMap[item.path] || item.label || fallbackTitle(item.path),
    key: slugToKey(item.path),
    permission: specialPermissions[item.path] || permissionByArea[area] || 'report:view',
  }
})

export const dashboardByRole = {
  [ROLES.ADMIN]: '/dashboard/admin',
  [ROLES.CEO]: '/dashboard/ceo',
  [ROLES.SALES]: '/dashboard/sales',
  [ROLES.PRODUCTION_MANAGER]: '/dashboard/production',
  [ROLES.STOCK_MANAGER]: '/dashboard/inventory',
  [ROLES.SUPERVISOR]: '/dashboard/supervisor',
  [ROLES.OPERATOR]: '/dashboard/operator',
  [ROLES.QC]: '/dashboard/qc',
  [ROLES.PACKAGING]: '/dashboard/packaging',
  [ROLES.DISPATCH]: '/dashboard/dispatch',
  [ROLES.ACCOUNTS]: '/dashboard/billing',
}
