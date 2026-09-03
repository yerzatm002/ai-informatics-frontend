import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { learningApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/Loading'
import ProgressBar from '../components/ProgressBar'
import MetricCard from '../components/MetricCard'
import { getErrorMessage } from '../utils/errors'

export default function Dashboard() {
  const { user } = useAuth()
  const [topics, setTopics] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([learningApi.topics(), learningApi.progress()])
      .then(([topicsRes, progressRes]) => {
        setTopics(topicsRes.data)
        setProgress(progressRes.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const preDone = Boolean(progress) && progress.pre_test !== null
  const allTasksDone = Number(progress?.task_completion_percent) >= 100
  const postDone = Boolean(progress) && progress.post_test !== null

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-soft sm:p-9">
        <div className="grid gap-7 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-200">{user?.experiment_group === 'AI' ? '✦ AI эксперименттік тобы' : 'CONTROL тобы'}</div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Сәлем, {user?.name?.split(' ')[0]}!</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Информатика бойынша оқу траекториясын аяқтап, зерттеу нәтижелерін қалыптастырыңыз.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <ProgressBar value={progress?.task_completion_percent || 0} label="Практикалық прогресс" />
            <div className="mt-4 text-sm text-slate-300">{progress?.tasks_completed || 0} / {progress?.total_tasks || 0} тапсырма орындалды</div>
          </div>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pre-test" value={progress?.pre_test != null ? `${progress.pre_test}/10` : '—'} hint="Бастапқы білім деңгейі" />
        <MetricCard label="Post-test" value={progress?.post_test != null ? `${progress.post_test}/10` : '—'} hint="Оқудан кейінгі нәтиже" accent="emerald" />
        <MetricCard label="Learning Gain" value={progress?.learning_gain != null ? `${progress.learning_gain > 0 ? '+' : ''}${progress.learning_gain}` : '—'} hint="Post − Pre" accent="violet" />
        <MetricCard label="Белсенділік" value={user?.experiment_group === 'AI' ? `${progress?.ai_messages || 0} AI` : `${progress?.total_attempts || 0} әрекет`} hint={user?.experiment_group === 'AI' ? 'ЖИ-агентпен диалогтар' : 'Тапсырма әрекеттері'} accent="amber" />
      </section>

      {!preDone && (
        <section className="card border-blue-200 bg-blue-50 p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-blue-600">1-қадам</div>
            <h2 className="mt-1 text-xl font-black text-slate-900">Алдымен Pre-test тапсырыңыз</h2>
            <p className="mt-2 text-sm text-slate-600">10 сұрақ бастапқы білім деңгейін анықтайды. Тест бір рет қана тапсырылады.</p>
          </div>
          <Link to="/test/PRE" className="btn-primary mt-4 sm:mt-0">Pre-test бастау →</Link>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-blue-600">Оқу модульдері</div>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Информатика курсы</h2>
          </div>
          <span className="text-sm text-slate-500">{topics.length} тақырып</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {topics.map((topic, index) => (
            <div key={topic.id} className={`card p-6 ${!preDone ? 'opacity-60' : ''}`}>
              <div className="mb-5 flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700">0{index + 1}</div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Тақырып</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">{topic.title}</h3>
              <p className="mt-2 min-h-[48px] text-sm leading-relaxed text-slate-500">{topic.description}</p>
              {preDone ? (
                <Link to={`/course/${topic.id}`} className="btn-secondary mt-5 w-full">Ашу →</Link>
              ) : (
                <button disabled className="btn-secondary mt-5 w-full cursor-not-allowed">Pre-test қажет</button>
              )}
            </div>
          ))}
        </div>
      </section>

      {preDone && !postDone && (
        <section className="card p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-emerald-600">Қорытынды кезең</div>
            <h2 className="mt-1 text-xl font-black">Post-test</h2>
            <p className="mt-2 text-sm text-slate-500">Барлық практикалық тапсырманы орындағаннан кейін қорытынды тест ашылады.</p>
          </div>
          {allTasksDone ? <Link to="/test/POST" className="btn-primary mt-4 sm:mt-0">Post-test тапсыру →</Link> : <button disabled className="btn-primary mt-4 sm:mt-0">Алдымен {progress?.total_tasks - progress?.tasks_completed} тапсырма қалды</button>}
        </section>
      )}

      {postDone && (
        <section className="card border-emerald-200 bg-emerald-50 p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-emerald-700">Оқу кезеңі аяқталды</div>
            <h2 className="mt-1 text-xl font-black">Нәтиже дайын</h2>
            <p className="mt-2 text-sm text-slate-600">Енді қысқа сауалнаманы толтырып, өз нәтижеңізді көре аласыз.</p>
          </div>
          <div className="mt-4 flex gap-2 sm:mt-0">
            <Link to="/survey" className="btn-secondary">Сауалнама</Link>
            <Link to="/result" className="btn-primary">Нәтиже</Link>
          </div>
        </section>
      )}
    </div>
  )
}
