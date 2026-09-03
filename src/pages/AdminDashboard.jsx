import { useEffect, useState } from 'react'
import { adminApi } from '../api'
import Loading from '../components/Loading'
import MetricCard from '../components/MetricCard'
import { getErrorMessage } from '../utils/errors'

function ComparisonBar({ label, control, ai, max = 10 }) {
  const controlPct = Math.max(0, Math.min(100, ((Number(control) || 0) / max) * 100))
  const aiPct = Math.max(0, Math.min(100, ((Number(ai) || 0) / max) * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="text-xs text-slate-400">CONTROL / AI</span>
      </div>
      <div className="grid grid-cols-[78px_1fr_45px] items-center gap-3 text-xs">
        <span className="font-bold text-slate-500">CONTROL</span>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-500" style={{ width: `${controlPct}%` }} /></div>
        <span className="text-right font-black">{control ?? '—'}</span>
      </div>
      <div className="grid grid-cols-[78px_1fr_45px] items-center gap-3 text-xs">
        <span className="font-bold text-violet-600">AI</span>
        <div className="h-3 overflow-hidden rounded-full bg-violet-50"><div className="h-full rounded-full bg-violet-600" style={{ width: `${aiPct}%` }} /></div>
        <span className="text-right font-black text-violet-700">{ai ?? '—'}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [includeDemo, setIncludeDemo] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        adminApi.analytics(includeDemo),
        adminApi.users(includeDemo),
      ])
      setAnalytics(analyticsRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [includeDemo])

  const exportCsv = async () => {
    setExporting(true)
    try {
      const response = await adminApi.exportCsv(includeDemo)
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'experiment_results.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(getErrorMessage(err, 'CSV экспорттау мүмкін болмады'))
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <Loading text="Зерттеу деректері жүктелуде..." />

  const control = analytics?.control || {}
  const ai = analytics?.ai || {}
  const totalParticipants = (control.participants || 0) + (ai.participants || 0)

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-blue-600">Research Admin</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Эксперимент аналитикасы</h1>
          <p className="mt-2 text-slate-500">CONTROL және AI топтарының оқу нәтижелерін салыстыру.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={includeDemo} onChange={(e) => setIncludeDemo(e.target.checked)} className="h-4 w-4 accent-blue-600" />
            Demo деректер
          </label>
          <button onClick={exportCsv} disabled={exporting} className="btn-primary">{exporting ? 'Экспорт...' : 'CSV экспорт'}</button>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Participants" value={totalParticipants} hint={`CONTROL ${control.participants || 0} · AI ${ai.participants || 0}`} />
        <MetricCard label="AI Learning Gain" value={ai.avg_learning_gain ?? '—'} hint="Эксперименттік топтың орташа өсімі" accent="violet" />
        <MetricCard label="Control Gain" value={control.avg_learning_gain ?? '—'} hint="Бақылау тобының орташа өсімі" accent="emerald" />
        <MetricCard label="AI interactions" value={ai.ai_interactions || 0} hint="ЖИ-агентпен сақталған әрекеттер" accent="amber" />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-black">Топтарды салыстыру</h2>
            <p className="mt-1 text-sm text-slate-500">Орташа академиялық және белсенділік көрсеткіштері.</p>
          </div>
          <div className="space-y-7">
            <ComparisonBar label="Pre-test" control={control.avg_pre_test} ai={ai.avg_pre_test} max={10} />
            <ComparisonBar label="Post-test" control={control.avg_post_test} ai={ai.avg_post_test} max={10} />
            <ComparisonBar label="Learning Gain" control={control.avg_learning_gain} ai={ai.avg_learning_gain} max={5} />
            <ComparisonBar label="Engagement" control={control.avg_engagement_score} ai={ai.avg_engagement_score} max={5} />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-black">Эксперименттік summary</h2>
            <p className="mt-1 text-sm text-slate-500">Backend есептейтін негізгі көрсеткіштер.</p>
          </div>
          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
            <span>Көрсеткіш</span><span className="text-center">CONTROL</span><span className="text-center">AI</span>
          </div>
          {[
            ['Қатысушылар', control.participants, ai.participants],
            ['Pre-test', control.avg_pre_test, ai.avg_pre_test],
            ['Post-test', control.avg_post_test, ai.avg_post_test],
            ['Learning Gain', control.avg_learning_gain, ai.avg_learning_gain],
            ['Engagement', control.avg_engagement_score, ai.avg_engagement_score],
            ['Correct attempts', control.completed_task_attempts, ai.completed_task_attempts],
            ['AI interactions', control.ai_interactions, ai.ai_interactions],
          ].map(([label, c, a]) => (
            <div key={label} className="grid grid-cols-3 border-b border-slate-100 px-5 py-3.5 text-sm last:border-b-0">
              <span className="font-semibold text-slate-600">{label}</span>
              <span className="text-center font-black text-slate-800">{c ?? '—'}</span>
              <span className="text-center font-black text-violet-700">{a ?? '—'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-black">Қатысушылар</h2>
            <p className="mt-1 text-sm text-slate-500">{users.length} аккаунт көрсетілуде</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Аты</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Group</th>
                <th className="px-5 py-3">Demo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{u.id}</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{u.name}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{u.role}</span></td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${u.experiment_group === 'AI' ? 'bg-violet-100 text-violet-700' : u.experiment_group === 'CONTROL' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'}`}>{u.experiment_group || '—'}</span></td>
                  <td className="px-5 py-3 text-slate-500">{u.is_demo ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
