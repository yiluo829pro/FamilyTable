import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'

export default function Landing() {
  const { user, loading } = useAuthStore()

  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="font-heading text-xl font-semibold text-forest">Family Table</span>
        </div>
        <Link to="/login" className="btn-primary text-sm">Sign in</Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl">
          <div className="text-6xl mb-6">🍽️</div>
          <h1 className="font-heading text-5xl font-bold text-forest mb-4 leading-tight">
            Your family's food memories,<br />
            <span className="text-amber-dark italic">all at one table.</span>
          </h1>
          <p className="text-stone-600 text-lg mb-10 leading-relaxed">
            Capture cherished recipes, plan unforgettable dinner parties, and let guests vote on what's for dinner — together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="btn-primary text-base px-8 py-3">Get started free</Link>
            <a href="#features" className="btn-outline text-base px-8 py-3">Learn more</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl text-center text-forest mb-12">Everything your family dinner needs</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: '📖', title: 'Dish Library', desc: 'Store recipes, stories, and photos from every family cook. Never lose a beloved recipe again.' },
              { icon: '🗳️', title: 'Guest Voting', desc: 'Share a link with guests before the dinner. Let them vote on shortlisted dishes in real time.' },
              { icon: '🤝', title: 'Potluck Coordination', desc: 'Coordinate who brings what — from drinks to desserts — with a live sign-up board.' },
            ].map(f => (
              <div key={f.title} className="card p-6 text-center">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-heading text-lg font-semibold text-forest mb-2">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="font-heading text-3xl text-forest mb-4">Ready to set the table?</h2>
        <p className="text-stone-500 mb-6">Sign in with your email — no password needed.</p>
        <Link to="/login" className="btn-primary px-10 py-3 text-base">Start for free</Link>
      </section>

      <footer className="border-t border-stone-100 py-6 text-center text-stone-400 text-sm">
        © {new Date().getFullYear()} Family Table. Made with ❤️ for families everywhere.
      </footer>
    </div>
  )
}
