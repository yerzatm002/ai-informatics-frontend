import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../utils/errors'

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Құпиясөз кемінде 8 таңбадан тұруы керек.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Құпиясөздер сәйкес келмейді.')
      return
    }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Тіркелу мүмкін болмады'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 px-5 py-10">
      <div className="w-full max-w-lg">
        <Link to="/login" className="mb-5 inline-flex text-sm font-bold text-blue-600">← Кіру бетіне</Link>
        <div className="card p-7 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 font-black text-white">AI</div>
            <div>
              <h1 className="text-2xl font-black">Жаңа аккаунт</h1>
              <p className="text-sm text-slate-500">Жүйе сізді CONTROL немесе AI тобына автоматты түрде бөледі.</p>
            </div>
          </div>

          {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold">Аты-жөні</label>
              <input className="input" value={form.name} onChange={update('name')} placeholder="Аружан Сейітова" minLength={2} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Email</label>
              <input type="email" className="input" value={form.email} onChange={update('email')} placeholder="student@example.com" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold">Құпиясөз</label>
                <input type="password" className="input" value={form.password} onChange={update('password')} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Қайталаңыз</label>
                <input type="password" className="input" value={form.confirm} onChange={update('confirm')} required />
              </div>
            </div>
            <button disabled={loading} className="btn-primary w-full py-3">{loading ? 'Тіркелу...' : 'Тіркелу және бастау'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
