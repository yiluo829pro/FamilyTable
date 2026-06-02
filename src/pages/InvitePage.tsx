import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'found' | 'accepting' | 'done' | 'error'>('loading')
  const [invite, setInvite] = useState<{ id: number; table_id: number; invited_email: string | null } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) return
    supabase
      .from('table_members')
      .select('id, table_id, invited_email')
      .eq('id', Number(token))
      .is('accepted_at', null)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus('error')
          setErrorMsg('Invite not found or already used.')
        } else {
          setInvite(data)
          setStatus('found')
        }
      })
  }, [token])

  const accept = async () => {
    if (!invite || !user) return
    setStatus('accepting')
    const { error } = await supabase
      .from('table_members')
      .update({ user_id: user.id, accepted_at: new Date().toISOString() })
      .eq('id', invite.id)
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('done')
      setTimeout(() => navigate(`/tables/${invite.table_id}`), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-8 text-center">
        <div className="text-4xl mb-4">🍽️</div>
        {status === 'loading' && <p className="text-stone-500">Loading invite…</p>}
        {status === 'found' && (
          <>
            <h2 className="font-heading text-xl font-semibold text-forest mb-2">You're invited!</h2>
            <p className="text-stone-500 text-sm mb-6">
              You've been invited as a co-manager. {user ? '' : 'Please sign in first to accept.'}
            </p>
            {user ? (
              <button onClick={accept} className="btn-primary w-full">Accept invitation</button>
            ) : (
              <Link to="/login" className="btn-primary block">Sign in to accept</Link>
            )}
          </>
        )}
        {status === 'accepting' && <p className="text-stone-500">Accepting…</p>}
        {status === 'done' && (
          <>
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-heading text-xl text-forest">Welcome to the table!</h2>
            <p className="text-stone-400 text-sm mt-2">Redirecting…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="font-heading text-xl text-red-500 mb-2">Oops</h2>
            <p className="text-stone-500 text-sm mb-4">{errorMsg}</p>
            <Link to="/" className="text-forest hover:underline text-sm">Go home</Link>
          </>
        )}
      </div>
    </div>
  )
}
