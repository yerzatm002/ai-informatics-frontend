import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { learningApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useAgent } from '../contexts/AgentContext'
import Loading from '../components/Loading'
import { getErrorMessage } from '../utils/errors'

export default function Course() {
  const { topicId } = useParams()
  const { user } = useAuth()
  const { openAgent, setContext } = useAgent()
  const [topic, setTopic] = useState(null)
  const [tasks, setTasks] = useState([])
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState({})
  const [submitting, setSubmitting] = useState(null)
  const [activeLesson, setActiveLesson] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([learningApi.topic(topicId), learningApi.tasks(topicId)])
      .then(([topicRes, tasksRes]) => {
        setTopic(topicRes.data)
        setTasks(tasksRes.data)
        setContext({ topicId: Number(topicId), taskId: null, starter: '' })
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [topicId, setContext])

  const completedThisSession = useMemo(() => Object.values(results).filter((r) => r?.is_correct).length, [results])

  if (loading) return <Loading />
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
  if (!topic) return null

  const submitTask = async (task) => {
    const answer = (answers[task.id] || '').trim()
    if (!answer) return
    setSubmitting(task.id)
    try {
      const { data } = await learningApi.submitTask(task.id, answer)
      setResults((prev) => ({ ...prev, [task.id]: data }))
    } catch (err) {
      setResults((prev) => ({ ...prev, [task.id]: { error: getErrorMessage(err) } }))
    } finally {
      setSubmitting(null)
    }
  }

  const askHint = (task) => {
    openAgent({
      topicId: Number(topicId),
      taskId: task.id,
      starter: 'Осы тапсырманы бірден шешіп бермей, маған қадамдық hint берші.',
    })
  }

  const lesson = topic.lessons?.[activeLesson]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link to="/" className="font-semibold text-blue-600">Басты бет</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500">{topic.title}</span>
      </div>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
          <div className="text-xs font-black uppercase tracking-widest text-blue-300">Оқу модулі</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">{topic.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-300">{topic.description}</p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr]">
          <div className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
            <div className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Сабақтар</div>
            <div className="space-y-2">
              {topic.lessons.map((item, index) => (
                <button key={item.id} onClick={() => setActiveLesson(index)} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition ${activeLesson === index ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
                  {index + 1}. {item.title}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-black">{lesson?.title}</h2>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700">{lesson?.content}</p>
            {lesson?.example && (
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="mb-2 text-xs font-black uppercase tracking-widest text-blue-600">Мысал</div>
                <p className="leading-7 text-slate-700">{lesson.example}</p>
              </div>
            )}
            {user?.experiment_group === 'AI' && (
              <button onClick={() => openAgent({ topicId: Number(topicId), taskId: null, starter: 'Осы тақырыпты қарапайым тілмен және бір мысалмен түсіндірші.' })} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-700 hover:bg-violet-100">✦ ЖИ-агенттен түсіндіру сұрау</button>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-blue-600">Практика</div>
            <h2 className="mt-1 text-2xl font-black">Тапсырмалар</h2>
          </div>
          <div className="text-sm font-semibold text-slate-500">Осы сессияда: {completedThisSession}/{tasks.length}</div>
        </div>

        <div className="space-y-4">
          {tasks.map((task, index) => {
            const result = results[task.id]
            return (
              <div key={task.id} className={`card p-5 sm:p-6 ${result?.is_correct ? 'border-emerald-200' : ''}`}>
                <div className="flex gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 font-black text-slate-600">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-7 text-slate-900">{task.question}</h3>
                    <div className="mt-4">
                      {task.task_type === 'MULTIPLE_CHOICE' && Array.isArray(task.options) ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {task.options.map((option) => (
                            <label key={option} className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold transition ${answers[task.id] === option ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                              <input type="radio" name={`task-${task.id}`} value={option} checked={answers[task.id] === option} onChange={() => setAnswers((prev) => ({ ...prev, [task.id]: option }))} className="sr-only" />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input className="input" value={answers[task.id] || ''} onChange={(e) => setAnswers((prev) => ({ ...prev, [task.id]: e.target.value }))} placeholder="Жауабыңызды жазыңыз" />
                      )}
                    </div>

                    {result?.is_correct && (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><strong>Дұрыс!</strong> {result.explanation}</div>
                    )}
                    {result && !result.is_correct && !result.error && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Жауап дұрыс емес. Бұл {result.attempt_number}-әрекет. Тағы бір рет ойланып көріңіз.</div>
                    )}
                    {result?.error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{result.error}</div>}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => submitTask(task)} disabled={submitting === task.id || !answers[task.id]} className="btn-primary">{submitting === task.id ? 'Тексеру...' : result?.is_correct ? 'Қайта тексеру' : 'Жауапты тексеру'}</button>
                      {user?.experiment_group === 'AI' && !result?.is_correct && (
                        <button onClick={() => askHint(task)} className="btn-secondary border-violet-200 text-violet-700">✦ Hint сұрау</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="flex justify-between">
        <Link to="/" className="btn-secondary">← Курстарға қайту</Link>
        <Link to="/" className="btn-primary">Прогресті көру →</Link>
      </div>
    </div>
  )
}
