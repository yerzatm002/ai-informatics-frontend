import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AIAgentWidget from './AIAgentWidget'

const studentLinks = [
  { to: '/', label: 'Басты бет', icon: '⌂' },
  { to: '/result', label: 'Нәтижелер', icon: '↗' },
  { to: '/survey', label: 'Сауалнама', icon: '✓' },
]

export default function AppShell({ admin = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = admin
    ? [{ to: '/admin', label: 'Research Dashboard', icon: '▦' }]
    : studentLinks

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-100 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-xl font-black text-white">AI</div>
            <div>
              <div className="font-black tracking-tight text-slate-900">Informatics</div>
              <div className="text-xs text-slate-500">Interactive Learning</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/admin'}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-sm">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <div className="truncate text-sm font-bold text-slate-900">{user?.name}</div>
            <div className="truncate text-xs text-slate-500">{user?.email}</div>
            {!admin && user?.experiment_group && (
              <div className="mt-2 text-xs font-bold text-blue-700">Group: {user.experiment_group}</div>
            )}
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full">Шығу</button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 font-black text-white">AI</div>
              <span className="font-black">Informatics</span>
            </div>
            <div className="hidden text-sm text-slate-500 lg:block">
              {admin ? 'Эксперименттік зерттеу панелі' : 'Информатика пәнін оқытудағы ЖИ-қолдау жүйесі'}
            </div>
            <div className="flex items-center gap-2">
              {!admin && user?.experiment_group && (
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  user.experiment_group === 'AI' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {user.experiment_group}
                </span>
              )}
              <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 lg:hidden">Шығу</button>
            </div>
          </div>
          {!admin && (
            <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden">
              {studentLinks.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      {!admin && <AIAgentWidget />}
    </div>
  )
}
