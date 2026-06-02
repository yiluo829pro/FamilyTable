import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-stone-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <span className="text-2xl">🍽️</span>
          <span className="font-heading text-xl font-semibold text-forest group-hover:text-forest-light transition-colors">
            Family Table
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-stone-600 hover:text-forest transition-colors font-medium"
              >
                My Tables
              </Link>
              <span className="text-stone-300">|</span>
              <span className="text-sm text-stone-500 truncate max-w-[150px]">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-stone-500 hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
