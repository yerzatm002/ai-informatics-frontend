import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { learningApi, surveyApi } from '../api'
import Loading from '../components/Loading'
import { getErrorMessage } from '../utils/errors'

const labels = ['Толық келіспеймін', 'Келіспеймін', 'Бейтарап', 'Келісемін', 'Толық келісемін']

export default function Survey() {
  const [questions, setQuestions] = useState([])
  const [progress, setProgress] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([surveyApi.get(), learningApi.progress()])
      .then(([surveyRes, progressRes]) => {
        setQuestions(surveyRes.data)
        setProgress(progressRes.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  if (progress && progress.post_test === null) {
    return (
      <div className="mx-auto max-w-2xl card p-8 text-center">
        <h1 className="text-2xl font-black">Сауалнама әлі қолжетімсіз</h1>
        <p className="mt-2 text-slate-500">Алдымен оқу кезеңін және Post-test-ті аяқтаңыз.</p>
        <Link to="/" className="btn-primary mt-5">Басты бетке қайту</Link>
      </div>
    )
  }

  const submit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError('Барлық тұжырымды бағалаңыз.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const payload = questions.map((q) => ({ question_id: q.id, value: Number(answers[q.id]) }))
      const { data } = await surveyApi.submit(payload)
      setResult(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl card p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-2xl">✓</div>
        <h1 className="mt-5 text-2xl font-black">Рақмет!</h1>
        <p className="mt-2 text-slate-500">Сіздің жауаптарыңыз зерттеу деректеріне сақталды.</p>
        <div className="mx-auto mt-6 max-w-xs rounded-2xl bg-blue-50 p-5">
          <div className="text-sm font-bold text-blue-600">Engagement score</div>
          <div className="mt-1 text-4xl font-black text-blue-800">{result.engagement_score}/5</div>
        </div>
        <Link to="/result" className="btn-primary mt-6">Нәтижеге өту →</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <div className="text-xs font-black uppercase tracking-widest text-blue-600">Зерттеу сауалнамасы</div>
        <h1 className="mt-1 text-3xl font-black">Танымдық белсенділікті бағалау</h1>
        <p className="mt-2 text-slate-500">Әр тұжырымды 1-ден 5-ке дейін бағалаңыз.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {questions.map((q, index) => (
        <div key={q.id} className="card p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 font-black text-blue-700">{index + 1}</div>
            <div className="flex-1">
              <h2 className="font-bold leading-7">{q.text}</h2>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: value }))} className={`rounded-xl border p-3 text-center transition ${Number(answers[q.id]) === value ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                    <div className="text-lg font-black">{value}</div>
                    <div className="mt-1 hidden text-[10px] leading-tight sm:block">{labels[value - 1]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button onClick={submit} disabled={submitting || Object.keys(answers).length !== questions.length} className="btn-primary w-full py-3">{submitting ? 'Сақталуда...' : 'Сауалнаманы жіберу'}</button>
    </div>
  )
}
