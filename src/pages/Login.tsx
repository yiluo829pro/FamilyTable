import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'

export default function Login() {
  const { user } = useAuthStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-1">
            <span className="text-4xl">🍽️</span>
            <span className="font-heading text-2xl font-bold text-forest">Family Table</span>
          </Link>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="font-heading text-xl font-semibold text-forest mb-2">Check your email</h2>
              <p className="text-stone-500 text-sm">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-6 text-sm text-forest hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-2xl font-semibold text-forest mb-2">Welcome back</h2>
              <p className="text-stone-500 text-sm mb-6">Enter your email to receive a magic sign-in link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending…' : 'Send magic link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-stone-400 text-xs mt-6">
          No password needed. No spam. Just a secure link.
        </p>
      </div>
    </div>
  )
}
