import { Link, useLocation } from 'react-router-dom'

export function Sidebar({ items, collapsed, userName, role }) {
  const { pathname } = useLocation()
  return (
    <aside className={`${collapsed ? 'w-20' : 'w-72'} sticky top-0 hidden h-screen shrink-0 self-start border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:flex md:flex-col`}>
      <div className={`mb-5 rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 to-indigo-50 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 ${collapsed ? 'p-2' : 'p-3'}`}>
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-600 to-indigo-700 text-xs font-bold text-white">AA</div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">AASA ERP</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manufacturing Suite</p>
            </div>
          )}
        </div>
      </div>
      <nav className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.path
          return (
            <Link key={item.path} to={item.path} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? 'bg-gradient-to-r from-sky-600 to-indigo-700 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}>
              <Icon size={16} /> {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>
      <div className={`mt-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 ${collapsed ? 'p-2' : 'p-3'}`}>
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-600 to-indigo-700 text-xs font-semibold text-white">
            {(userName || 'U').slice(0, 1)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{userName || 'ERP User'}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
