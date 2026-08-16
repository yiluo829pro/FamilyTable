import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import ExperienceCard from '../../components/experiences/ExperienceCard'
import type { Experience } from '../../types'

const SUB_FILTERS = ['All', 'Restaurant', 'Café', 'Travel', 'Cookbook']
const STATUS_FILTERS = ['All', 'Tried & Loved', 'Tried', 'Wishlist']

const SUB_MAP: Record<string, string> = {
  Restaurant: 'restaurant', Café: 'cafe', Travel: 'travel', Cookbook: 'cookbook',
}
const STATUS_MAP: Record<string, string> = {
  'Tried & Loved': 'tried_loved', Tried: 'tried', Wishlist: 'wishlist',
}

export default function ExperienceList() {
  const { user } = useAuthStore()
  const [subFilter, setSubFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  const { data: experiences, isLoading } = useQuery({
    queryKey: ['experiences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) return [] as Experience[]
      return data as Experience[]
    },
    enabled: !!user,
  })

  const filtered = (experiences ?? []).filter(e => {
    if (subFilter !== 'All' && e.sub_category !== SUB_MAP[subFilter]) return false
    if (statusFilter !== 'All' && e.status !== STATUS_MAP[statusFilter]) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-forest">My Experiences</h1>
          <p className="text-stone-500 mt-1">Restaurants, cafés, travels, cookbooks — outside the home kitchen</p>
        </div>
        <Link to="/experiences/new" className="btn-primary">+ Add Experience</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SUB_FILTERS.map(f => (
          <button key={f} onClick={() => setSubFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              subFilter === f ? 'bg-forest text-white border-forest' : 'border-stone-200 text-stone-600 hover:border-forest'
            }`}>
            {f}
          </button>
        ))}
        <div className="w-px bg-stone-200 mx-1" />
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === f ? 'bg-amber text-white border-amber' : 'border-stone-200 text-stone-600 hover:border-amber'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search experiences…"
          className="input-field max-w-xs text-sm"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🗺️</div>
          <h2 className="font-heading text-xl font-semibold text-forest mb-2">No experiences yet</h2>
          <p className="text-stone-500 text-sm mb-6">Log a restaurant visit, café trip, travel memory, or cookbook you love.</p>
          <Link to="/experiences/new" className="btn-primary">+ Add your first experience</Link>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(e => (
            <ExperienceCard key={e.id} experience={e} editPath={`/experiences/${e.id}/edit`} />
          ))}
        </div>
      )}
    </div>
  )
}
