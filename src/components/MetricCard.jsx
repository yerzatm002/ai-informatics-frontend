export default function MetricCard({ label, value, hint, accent = 'blue' }) {
  const accents = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className="card p-5">
      <div className={`mb-4 inline-flex rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${accents[accent] || accents.blue}`}>
        {label}
      </div>
      <div className="text-3xl font-black tracking-tight text-slate-900">{value ?? '—'}</div>
      {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
    </div>
  )
}
