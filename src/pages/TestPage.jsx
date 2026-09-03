import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { learningApi, testApi } from '../api'
import Loading from '../components/Loading'
import { getErrorMessage } from '../utils/errors'

export default function TestPage() {
  const { type: rawType } = useParams()
  const type = rawType?.toUpperCase() === 'POST' ? 'POST' : 'PRE'
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([testApi.get(type), learningApi.progress()])
      .then(([questionsRes, progressRes]) => {
        setQuestions(questionsRes.data)
        setProgress(progressRes.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [type])

  const alreadyDone = Boolean(progress) && (type === 'PRE' ? progress.pre_test !== null : progress.post_test !== null)
  const answered = useMemo(() => Object.values(answers).filter(Boolean).length, [answers])

  if (loading) return <Loading />

  const submit = async () => {
    if (answered !== questions.length) {
      setError('Барлық сұраққа жауап беріңіз.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const { data } = await testApi.submit(type, answers)
      setResult(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (alreadyDone && !result) {
    return (
      <div className="mx-auto max-w-2xl card p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-2xl">✓</div>
        <h1 className="mt-5 text-2xl font-black">{type} test бұрын тапсырылған</h1>
        <p className="mt-2 text-slate-500">Бұл тест эксперимент тазалығы үшін бір рет қана тапсырылады.</p>
        <Link to="/result" className="btn-primary mt-6">Нәтижені көру</Link>
      </div>
    )
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl card overflow-hidden">
        <div className="bg-slate-950 p-8 text-center text-white">
          <div className="text-sm font-black uppercase tracking-widest text-blue-300">{result.test_type} test аяқталды</div>
          <div className="mt-4 text-6xl font-black">{result.score}/{result.total_questions}</div>
          <div className="mt-2 text-slate-300">{result.percentage}%</div>
        </div>
        <div className="p-8 text-center">
          {result.learning_gain !== null && result.learning_gain !== undefined && (
            <div className="mb-5 rounded-2xl bg-violet-50 p-5">
              <div className="text-sm font-bold text-violet-600">Learning Gain</div>
              <div className="mt-1 text-4xl font-black text-violet-800">{result.learning_gain > 0 ? '+' : ''}{result.learning_gain}</div>
            </div>
          )}
          <button onClick={() => navigate(type === 'POST' ? '/survey' : '/')} className="btn-primary">{type === 'POST' ? 'Сауалнамаға өту →' : 'Оқуды бастау →'}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/" className="text-sm font-bold text-blue-600">← Басты бет</Link>
          <div className="mt-3 text-xs font-black uppercase tracking-widest text-blue-600">{type === 'PRE' ? 'Бастапқы диагностика' : 'Қорытынды диагностика'}</div>
          <h1 className="mt-1 text-3xl font-black">{type} test</h1>
          <p className="mt-2 text-slate-500">10 сұрақ · бір дұрыс жауап · бір рет тапсырылады</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-sm">{answered}/{questions.length} жауап</div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {questions.map((question, index) => (
        <div key={question.id} className="card p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 font-black text-blue-700">{index + 1}</div>
            <div className="flex-1">
              <h2 className="font-bold leading-7">{question.question}</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <label key={option} className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold transition ${answers[String(question.id)] === option ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" className="sr-only" name={`q-${question.id}`} checked={answers[String(question.id)] === option} onChange={() => setAnswers((prev) => ({ ...prev, [String(question.id)]: option }))} />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 card flex items-center justify-between p-4">
        <span className="text-sm font-semibold text-slate-500">Барлық сұраққа жауап бергеннен кейін жіберіңіз.</span>
        <button onClick={submit} disabled={submitting || answered !== questions.length} className="btn-primary">{submitting ? 'Жіберу...' : 'Тестті аяқтау'}</button>
      </div>
    </div>
  )
}
