import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../utils/errors'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const current = await login(email, password)
      const destination = current?.role === 'ADMIN' ? '/admin' : (location.state?.from || '/')
      navigate(destination, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Email немесе құпиясөз қате'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.45),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.4),_transparent_34%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white font-black text-blue-700">AI</div>
          <div>
            <div className="text-xl font-black">AI Informatics</div>
            <div className="text-sm text-slate-300">Experimental learning platform</div>
          </div>
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-100">Магистрлік зерттеу MVP</div>
          <h1 className="text-5xl font-black leading-tight tracking-tight">Информатиканы ЖИ қолдауымен интерактивті үйрену.</h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">Pre-test, оқу модульдері, практикалық тапсырмалар, ЖИ-агент, post-test және зерттеу аналитикасы бір жүйеде.</p>
        </div>
        <div className="relative z-10 text-sm text-slate-400">FastAPI · React · Neon PostgreSQL · Gemini</div>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 font-black text-white">AI</div>
            <h1 className="text-2xl font-black">AI Informatics</h1>
          </div>
          <div className="card p-7 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight">Жүйеге кіру</h2>
            <p className="mt-2 text-sm text-slate-500">Оқу немесе зерттеу панеліне кіру үшін аккаунтыңызды пайдаланыңыз.</p>

            {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="student@example.com" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Құпиясөз</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
              </div>
              <button disabled={loading} className="btn-primary w-full py-3">{loading ? 'Кіру...' : 'Кіру'}</button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">Аккаунт жоқ па? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">Тіркелу</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
