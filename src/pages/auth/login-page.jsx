import { useNavigate } from 'react-router-dom'
import { ArrowRight, Factory, ShieldCheck, Sparkles } from 'lucide-react'
import { ROLES, useAuth } from '../../app/app-shell'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const role = form.get('role')
    const email = form.get('email')
    login(role, email)
    navigate('/')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 p-4">
      <div className="pointer-events-none absolute -left-16 -top-12 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-12 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-6 py-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-white backdrop-blur lg:block">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm">
            <Sparkles size={14} /> AASA Independent Manufacturing ERP
          </div>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight">Manufacturing control room for smarter production flow.</h1>
          <p className="mt-4 max-w-xl text-slate-300">Demand to Plan to Reserve to Produce to Inspect to Pack to Stock to Dispatch to Bill to Report.</p>
          <div className="mt-8 grid gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><Factory size={18} className="text-cyan-300" /><span>Unified plant operations and batch tracking</span></div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><ShieldCheck size={18} className="text-emerald-300" /><span>Role-based control with audit-ready workflows</span></div>
          </div>
        </section>

        <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur md:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Secure Access</p>
          <h2 className="text-3xl font-semibold text-slate-900">Welcome Back</h2>
          <p className="mb-6 mt-2 text-sm text-slate-500">Sign in to continue into your role workspace.</p>
          <div className="space-y-4">
            <input name="email" required placeholder="Employee Code / Email" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
            <input name="password" type="password" required placeholder="Password" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
            <select name="role" defaultValue={ROLES.ADMIN} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100">
              {Object.values(ROLES).map((role) => <option key={role}>{role}</option>)}
            </select>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-3 font-semibold text-white transition hover:from-cyan-500 hover:to-indigo-500">
              Login <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
