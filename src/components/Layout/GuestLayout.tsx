import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'

export default function GuestLayout() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-stone-100 py-3 px-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <span className="text-xl">🍽️</span>
          <span className="font-heading text-lg font-semibold text-forest">Family Table</span>
        </Link>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
