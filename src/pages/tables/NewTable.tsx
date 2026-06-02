import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export default function NewTable() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('tables')
      .insert({ name, description: description || null, created_by: user.id })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Add creator as admin member
    await supabase.from('table_members').insert({
      table_id: data.id,
      user_id: user.id,
      role: 'admin',
      accepted_at: new Date().toISOString(),
    })

    navigate(`/tables/${data.id}`)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-stone-500 hover:text-forest flex items-center gap-1">
          ← Back
        </button>
      </div>
      <div className="card p-8">
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">Create a Table</h1>
        <p className="text-stone-500 text-sm mb-6">A Table is your family's food circle — a place for dishes, memories, and dinner events.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Table name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. The Johnson Family Table"
              maxLength={80}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field min-h-[90px] resize-y"
              placeholder="A short description of your family food circle…"
              maxLength={300}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating…' : 'Create Table'}
          </button>
        </form>
      </div>
    </div>
  )
}
