export const ROLES = {
  ADMIN: 'Admin',
  CEO: 'CEO / Management',
  SALES: 'Sales Team',
  PRODUCTION_MANAGER: 'Production Manager',
  STOCK_MANAGER: 'Stock Manager',
  SUPERVISOR: 'Supervisor',
  OPERATOR: 'Operator',
  QC: 'QC Team',
  PACKAGING: 'Packaging Team',
  DISPATCH: 'Dispatch Team',
  ACCOUNTS: 'Accounts Team',
}

export const rolePermissions = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.CEO]: ['dashboard:ceo','sales:overview','production:overview','inventory:overview','qc:report','dispatch:overview','billing:overview','report:view'],
  [ROLES.SALES]: ['dashboard:sales','sales:view','sales:edit','dispatch:view','billing:view'],
  [ROLES.PRODUCTION_MANAGER]: ['dashboard:production','production:view','production:edit','inventory:view','report:view'],
  [ROLES.STOCK_MANAGER]: ['dashboard:inventory','inventory:view','inventory:edit','production:view'],
  [ROLES.SUPERVISOR]: ['dashboard:supervisor','production:view','production:execute','qc:view'],
  [ROLES.OPERATOR]: ['dashboard:operator','production:execute'],
  [ROLES.QC]: ['dashboard:qc','qc:view','qc:edit','report:view'],
  [ROLES.PACKAGING]: ['dashboard:packaging','packaging:view','packaging:edit','inventory:view'],
  [ROLES.DISPATCH]: ['dashboard:dispatch','dispatch:view','dispatch:edit','sales:view'],
  [ROLES.ACCOUNTS]: ['dashboard:billing','billing:view','billing:edit','report:view'],
}

export const can = (role, permission) => {
  const permissions = rolePermissions[role] || []
  return permissions.includes('*') || permissions.includes(permission)
}
