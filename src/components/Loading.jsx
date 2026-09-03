export default function Loading({ text = 'Жүктелуде...' }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="mt-4 text-sm font-medium text-slate-500">{text}</p>
      </div>
    </div>
  )
}
