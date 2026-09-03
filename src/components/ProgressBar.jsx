export default function ProgressBar({ value = 0, label, compact = false }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">{label}</span>
          <span className="font-bold text-slate-900">{Math.round(safe)}%</span>
        </div>
      )}
      <div className={`${compact ? 'h-2' : 'h-3'} overflow-hidden rounded-full bg-slate-100`}>
        <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${safe}%` }} />
      </div>
    </div>
  )
}
