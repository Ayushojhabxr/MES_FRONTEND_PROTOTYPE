import { Bell, Building2, LogOut, Menu, Moon, Sun } from 'lucide-react'

export function Topbar({ onToggle, role, onLogout, theme, onThemeToggle }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center gap-3"><button onClick={onToggle} className="rounded border p-1 dark:border-slate-700 dark:text-slate-200"><Menu size={18} /></button><div><p className="text-sm text-slate-500 dark:text-slate-300">AASA Independent Manufacturing ERP</p><p className="text-xs text-slate-400 dark:text-slate-500">{role}</p></div></div>
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><Building2 size={16}/>Plant 1</span>
        <button onClick={onThemeToggle} className="rounded-md border border-slate-300 p-1.5 dark:border-slate-700 dark:text-slate-200">
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <Bell size={16} className="text-slate-600 dark:text-slate-300"/>
        <button onClick={onLogout} className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-white dark:bg-sky-600"><LogOut size={14}/>Logout</button>
      </div>
    </header>
  )
}
