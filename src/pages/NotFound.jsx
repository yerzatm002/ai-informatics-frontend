import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-5">
      <div className="text-center">
        <div className="text-7xl font-black text-blue-600">404</div>
        <h1 className="mt-3 text-2xl font-black">Бет табылмады</h1>
        <Link to="/" className="btn-primary mt-6">Басты бетке</Link>
      </div>
    </div>
  )
}
