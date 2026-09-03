import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { learningApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/Loading'
import MetricCard from '../components/MetricCard'
import ProgressBar from '../components/ProgressBar'
import { getErrorMessage } from '../utils/errors'

export default function Result() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    learningApi.progress()
      .then(({ data }) => setProgress(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-black uppercase tracking-widest text-blue-600">Жеке нәтиже</div>
        <h1 className="mt-1 text-3xl font-black">Оқу аналитикасы</h1>
        <p className="mt-2 text-slate-500">{user?.name} · {user?.experiment_group} group</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pre-test" value={progress?.pre_test != null ? `${progress.pre_test}/10` : '—'} />
        <MetricCard label="Post-test" value={progress?.post_test != null ? `${progress.post_test}/10` : '—'} accent="emerald" />
        <MetricCard label="Learning Gain" value={progress?.learning_gain != null ? `${progress.learning_gain > 0 ? '+' : ''}${progress.learning_gain}` : '—'} accent="violet" />
        <MetricCard label="AI messages" value={progress?.ai_messages || 0} accent="amber" />
      </div>

      <section className="card p-6">
        <h2 className="text-lg font-black">Практикалық тапсырмалар</h2>
        <div className="mt-5">
          <ProgressBar value={progress?.task_completion_percent || 0} label={`${progress?.tasks_completed || 0}/${progress?.total_tasks || 0} тапсырма`} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Барлық әрекет</div>
            <div className="mt-1 text-2xl font-black">{progress?.total_attempts || 0}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Эксперименттік топ</div>
            <div className="mt-1 text-2xl font-black">{progress?.experiment_group}</div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/" className="btn-secondary">← Оқуға қайту</Link>
        {progress?.post_test != null && <Link to="/survey" className="btn-primary">Сауалнаманы толтыру</Link>}
      </div>
    </div>
  )
}
