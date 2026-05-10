import { createContext, useContext, useEffect, useState } from 'react'
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { sidebarConfig } from '../config/sidebarConfig'
import { ROLES } from '../config/rolePermissions'
import { dashboardData } from '../data/mockData'
import { dashboardByRole, modules } from './modules'
import { actionPageMap } from './actionPageRegistry'
import { Topbar } from '../components/layout/topbar'
import { Sidebar } from '../components/layout/sidebar'
import { KpiCards } from '../components/cards/kpi-cards'
import { ModulePage } from '../components/ui/module-page'
import { LoginPage } from '../pages/auth/login-page'
import { CeoDashboardPage } from '../pages/dashboard/ceo-dashboard-page'

const AuthContext = createContext(null)
const authKey = 'aasa_role'
const authUserKey = 'aasa_user'
const themeKey = 'aasa_theme'

const formatDisplayName = (value) => {
  const raw = (value || '').trim()
  if (!raw) return 'ERP User'
  const beforeAt = raw.includes('@') ? raw.split('@')[0] : raw
  return beforeAt
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function useAuth() { return useContext(AuthContext) }

function AuthProvider({ children }) {
  const [role, setRole] = useState(localStorage.getItem(authKey) || '')
  const [userId, setUserId] = useState(localStorage.getItem(authUserKey) || '')
  const [theme, setTheme] = useState(localStorage.getItem(themeKey) || 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(themeKey, theme)
  }, [theme])

  const login = (nextRole, identifier) => {
    localStorage.setItem(authKey, nextRole)
    localStorage.setItem(authUserKey, identifier || '')
    setRole(nextRole)
    setUserId(identifier || '')
  }
  const logout = () => {
    localStorage.removeItem(authKey)
    localStorage.removeItem(authUserKey)
    setRole('')
    setUserId('')
  }
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  return <AuthContext.Provider value={{ role, userId, userName: formatDisplayName(userId), theme, toggleTheme, login, logout }}>{children}</AuthContext.Provider>
}

function ProtectedLayout() {
  const { role, userName, theme, toggleTheme, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  if (!role) return <Navigate to="/login" replace />

  const items = sidebarConfig[role] || []
  const sidebarPaths = new Set(items.map((item) => item.path))
  const isKnownModule = modules.some((m) => m.path === location.pathname)
  const isAllowed = sidebarPaths.has(location.pathname) || location.pathname.startsWith('/dashboard/')
  if (isKnownModule && !isAllowed) return <Navigate to={dashboardByRole[role]} replace />

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar items={items} collapsed={collapsed} userName={userName} role={role} />
      <div className="min-w-0 flex-1">
        <Topbar theme={theme} onThemeToggle={toggleTheme} role={role} onToggle={() => setCollapsed((s) => !s)} onLogout={() => { logout(); navigate('/login') }} />
        <main className="min-w-0 max-w-full overflow-x-hidden p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { role } = useAuth()
  if (role === ROLES.CEO) return <CeoDashboardPage />

  const kpis = dashboardData[role]?.kpis || dashboardData.default.kpis
  const shortcuts = (sidebarConfig[role] || []).filter((item) => !item.path.startsWith('/dashboard/')).slice(0, 4)
  return (
    <section className="space-y-4">
      <div><p className="text-sm text-slate-500 dark:text-slate-400">Home / Dashboard</p><h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{role} Dashboard</h1></div>
      <KpiCards items={kpis} />
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Quick Actions</p>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => (
            <Link key={item.path} to={item.path} className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <ModulePage title={`${role} Snapshot`} dataKey={`dashboard_${role.replace(/\W+/g, '_').toLowerCase()}`} canCreate={false} allowEdit={false} />
    </section>
  )
}

function AppRoutes() {
  const { role } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to={role ? dashboardByRole[role] : '/login'} replace />} />
      <Route element={<ProtectedLayout />}>
        {Object.values(dashboardByRole).map((path) => <Route key={path} path={path} element={<DashboardPage />} />)}
        {modules.map((mod) => (
          <Route
            key={mod.path}
            path={mod.path}
            element={
              actionPageMap[mod.path]
                ? (() => {
                    const ActionComponent = actionPageMap[mod.path]
                    return <ActionComponent />
                  })()
                : <ModulePage title={mod.title} dataKey={mod.key} showApprove={mod.path.includes('approval') || mod.path.includes('planning')} allowEdit={!mod.path.includes('overview')} canCreate={!mod.path.includes('overview') && !mod.path.includes('audit')} />
            }
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function AppShell() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}

export { useAuth, ROLES }
