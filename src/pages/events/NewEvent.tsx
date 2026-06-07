import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { FamilyTable, Dish } from '../../types'
import DishCard from '../../components/dishes/DishCard'

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 30)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

export default function NewEvent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const defaultTableId = searchParams.get('tableId') ?? ''

  const [tableId, setTableId] = useState(defaultTableId)
  const [name, setName] = useState('')
  const [dinnerDate, setDinnerDate] = useState('')
  const [votingDeadline, setVotingDeadline] = useState('')
  const [slug, setSlug] = useState('')
  const [selectedDishIds, setSelectedDishIds] = useState<number[]>([])
  const [foodFundEnabled, setFoodFundEnabled] = useState(false)
  const [foodFundThreshold, setFoodFundThreshold] = useState('')
  const [potluckEnabled, setPotluckEnabled] = useState(false)
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (name) setSlug(generateSlug(name))
  }, [name])

  const { data: tables } = useQuery({
    queryKey: ['tables', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tables').select('*').order('name')
      if (error) throw error
      return data as FamilyTable[]
    },
    enabled: !!user,
  })

  const { data: dishes } = useQuery({
    queryKey: ['dishes', tableId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('table_id', Number(tableId))
        .eq('status', 'active')
        .order('name')
      if (error) throw error
      return data as Dish[]
    },
    enabled: !!tableId,
  })

  const toggleDish = (id: number) => {
    setSelectedDishIds(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (selectedDishIds.length < 2) {
      setError('Please select at least 2 dishes for the shortlist.')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: insertError } = await supabase
      .from('events')
      .insert({
        table_id: Number(tableId),
        name,
        dinner_date: dinnerDate || null,
        voting_deadline: votingDeadline || null,
        shortlist_dish_ids: selectedDishIds,
        slug,
        status: publish ? 'live' : 'draft',
        final_menu_dish_ids: [],
        food_fund_enabled: foodFundEnabled,
        food_fund_threshold: foodFundEnabled && foodFundThreshold ? Number(foodFundThreshold) : null,
        potluck_enabled: potluckEnabled,
        created_by: user.id,
      })
      .select()
      .single()

    setLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    navigate(`/events/${data.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-stone-500 hover:text-forest">← Back</button>
      </div>
      <div className="card p-8">
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">Create Event</h1>
        <p className="text-stone-500 text-sm mb-6">Set up a dinner event with a guest voting shortlist.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Table selection */}
          <div>
            <label className="label">Table *</label>
            <select
              required
              value={tableId}
              onChange={e => { setTableId(e.target.value); setSelectedDishIds([]) }}
              className="input-field"
            >
              <option value="">Choose a table…</option>
              {tables?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Event name */}
          <div>
            <label className="label">Event name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. Thanksgiving 2024"
            />
          </div>

          {/* Dates */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Dinner date</label>
              <input type="date" value={dinnerDate} onChange={e => setDinnerDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label">Voting deadline</label>
              <input type="datetime-local" value={votingDeadline} onChange={e => setVotingDeadline(e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="label">Event slug (URL)</label>
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-sm">/vote/</span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="input-field flex-1"
                placeholder="auto-generated"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={potluckEnabled}
                onChange={e => setPotluckEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-stone-700">Enable Potluck board</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={foodFundEnabled}
                onChange={e => setFoodFundEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-stone-700">Enable Food Fund</span>
            </label>
            {foodFundEnabled && (
              <div className="ml-7">
                <label className="label text-xs">Funding threshold ($)</label>
                <input
                  type="number"
                  value={foodFundThreshold}
                  onChange={e => setFoodFundThreshold(e.target.value)}
                  className="input-field w-40 text-sm"
                  placeholder="e.g. 50"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>

          {/* Dish shortlist */}
          {tableId && (
            <div>
              <label className="label">
                Shortlist dishes ({selectedDishIds.length} selected, min 2)
              </label>
              {!dishes || dishes.length === 0 ? (
                <p className="text-stone-400 text-sm">No active dishes in this table. Add some first.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {dishes.map(dish => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      selected={selectedDishIds.includes(dish.id)}
                      onSelect={() => toggleDish(dish.id)}
                      showSelect
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              onClick={() => setPublish(false)}
              className="btn-outline flex-1"
            >
              {loading ? 'Saving…' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={() => setPublish(true)}
              className="btn-primary flex-1"
            >
              {loading ? 'Publishing…' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
