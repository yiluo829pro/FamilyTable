import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { FamilyTable, Dish, Event } from '../../types'

function DishStatusBadge({ status }: { status: Dish['status'] }) {
  const colors = {
    active: 'bg-green-100 text-green-700',
    memory_only: 'bg-amber-100 text-amber-700',
    archived: 'bg-stone-100 text-stone-500',
  }
  const labels = { active: 'Active', memory_only: 'Memory', archived: 'Archived' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  )
}

function EventStatusBadge({ status }: { status: Event['status'] }) {
  const colors = {
    draft: 'bg-stone-100 text-stone-500',
    live: 'bg-green-100 text-green-700',
    voting_closed: 'bg-amber-100 text-amber-700',
    menu_announced: 'bg-blue-100 text-blue-700',
    archived: 'bg-stone-100 text-stone-400',
  }
  const labels = {
    draft: 'Draft', live: 'Live', voting_closed: 'Voting Closed',
    menu_announced: 'Menu Announced', archived: 'Archived',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function TableDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'dishes' | 'events'>('dishes')

  const { data: table, isLoading: tableLoading } = useQuery({
    queryKey: ['table', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tables').select('*').eq('id', Number(id)).single()
      if (error) throw error
      return data as FamilyTable
    },
  })

  const { data: dishes, isLoading: dishesLoading } = useQuery({
    queryKey: ['dishes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('table_id', Number(id))
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Dish[]
    },
  })

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('table_id', Number(id))
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Event[]
    },
  })

  if (tableLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )

  if (!table) return (
    <div className="max-w-xl mx-auto px-4 py-10 text-center">
      <p className="text-stone-500">Table not found.</p>
      <Link to="/dashboard" className="text-forest hover:underline text-sm mt-2 inline-block">Back to dashboard</Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-stone-500 hover:text-forest">← My Tables</button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-forest">{table.name}</h1>
          {table.description && <p className="text-stone-500 mt-1">{table.description}</p>}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to={`/events/new?tableId=${id}`} className="btn-secondary text-sm">+ New Event</Link>
          <Link to={`/tables/${id}/dishes/new`} className="btn-primary text-sm">+ Add Dish</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-stone-100">
        {(['dishes', 'events'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors -mb-px border-b-2 ${
              activeTab === tab
                ? 'border-forest text-forest'
                : 'border-transparent text-stone-500 hover:text-forest'
            }`}
          >
            {tab} {tab === 'dishes' ? `(${dishes?.length ?? 0})` : `(${events?.length ?? 0})`}
          </button>
        ))}
      </div>

      {/* Dishes */}
      {activeTab === 'dishes' && (
        <>
          {dishesLoading && <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div></div>}
          {!dishesLoading && dishes && dishes.length === 0 && (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🥘</div>
              <h3 className="font-heading text-lg text-forest mb-2">No dishes yet</h3>
              <p className="text-stone-500 text-sm mb-5">Add your first family recipe to this table.</p>
              <Link to={`/tables/${id}/dishes/new`} className="btn-primary text-sm">Add first dish</Link>
            </div>
          )}
          {dishes && dishes.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dishes.map(dish => (
                <div key={dish.id} className="card hover:shadow-md transition-shadow group">
                  <div className="h-36 bg-gradient-to-br from-amber/10 to-forest/10 flex items-center justify-center rounded-t-2xl overflow-hidden">
                    {dish.photos && dish.photos.length > 0 ? (
                      <img src={dish.photos[0]} alt={dish.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🍲</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-base font-semibold text-forest group-hover:text-forest-light transition-colors">
                        {dish.name}
                      </h3>
                      <DishStatusBadge status={dish.status} />
                    </div>
                    {dish.cuisine_tag && <p className="text-stone-400 text-xs mt-1">{dish.cuisine_tag}</p>}
                    {dish.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dish.dietary_tags.slice(0, 3).map(t => (
                          <span key={t} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-stone-50 flex justify-end">
                      <Link
                        to={`/tables/${id}/dishes/${dish.id}/edit`}
                        className="text-xs text-forest hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Events */}
      {activeTab === 'events' && (
        <>
          {eventsLoading && <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div></div>}
          {!eventsLoading && events && events.length === 0 && (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-heading text-lg text-forest mb-2">No events yet</h3>
              <p className="text-stone-500 text-sm mb-5">Create a dinner event and invite guests to vote.</p>
              <Link to={`/events/new?tableId=${id}`} className="btn-secondary text-sm">Create event</Link>
            </div>
          )}
          {events && events.length > 0 && (
            <div className="space-y-4">
              {events.map(event => (
                <Link key={event.id} to={`/events/${event.id}`} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow block">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-base font-semibold text-forest">{event.name}</h3>
                      <EventStatusBadge status={event.status} />
                    </div>
                    {event.dinner_date && (
                      <p className="text-stone-400 text-xs">
                        Dinner: {new Date(event.dinner_date).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-stone-400 text-xs mt-0.5">Slug: /vote/{event.slug}</p>
                  </div>
                  <span className="text-stone-300 text-lg">→</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
