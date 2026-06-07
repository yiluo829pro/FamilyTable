import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { FamilyTable, Dish, Event, Drink, MiscItem, Experience, Collection } from '../../types'
import DrinkCard from '../../components/drinks/DrinkCard'
import MiscCard from '../../components/misc/MiscCard'
import ExperienceCard from '../../components/experiences/ExperienceCard'
import CollectionCard from '../../components/collections/CollectionCard'

type SuperTab = 'food' | 'drinks' | 'misc' | 'experiences'

const SUB_FILTERS: Record<SuperTab, string[]> = {
  food: ['All', 'Active', 'Memory', 'Archived'],
  drinks: ['All', 'Coffee', 'Wine', 'Beer', 'Spirits', 'Sake', 'Tea', 'Non-Alc'],
  misc: ['All', 'Snacks', 'Condiments', 'Instant Noodles', 'Baked Goods'],
  experiences: ['All', 'Restaurant', 'Café', 'Travel', 'Cookbook'],
}

const STATUS_FILTERS = ['All', 'Tried & Loved', 'Tried', 'Wishlist']

function EventStatusBadge({ status }: { status: Event['status'] }) {
  const colors = {
    draft: 'bg-stone-100 text-stone-500',
    live: 'bg-green-100 text-green-700',
    voting_closed: 'bg-amber/20 text-amber-dark',
    menu_announced: 'bg-blue-100 text-blue-700',
    archived: 'bg-stone-100 text-stone-400',
  }
  const labels = { draft: 'Draft', live: 'Live', voting_closed: 'Voting Closed', menu_announced: 'Menu Announced', archived: 'Archived' }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status]}`}>{labels[status]}</span>
}

export default function TableDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SuperTab>('food')
  const [subFilter, setSubFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'recent' | 'rating' | 'name'>('recent')
  const [eventsOpen, setEventsOpen] = useState(false)

  const { data: table, isLoading: tableLoading } = useQuery({
    queryKey: ['table', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tables').select('*').eq('id', Number(id)).single()
      if (error) throw error
      return data as FamilyTable
    },
  })

  const { data: dishes } = useQuery({
    queryKey: ['dishes', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('dishes').select('*').eq('table_id', Number(id)).order('created_at', { ascending: false })
      if (error) throw error
      return data as Dish[]
    },
  })

  const { data: drinks } = useQuery({
    queryKey: ['drinks', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('drinks').select('*').eq('table_id', Number(id)).order('created_at', { ascending: false })
      if (error) throw error
      return data as Drink[]
    },
  })

  const { data: miscItems } = useQuery({
    queryKey: ['misc_items', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('misc_items').select('*').eq('table_id', Number(id)).order('created_at', { ascending: false })
      if (error) throw error
      return data as MiscItem[]
    },
  })

  const { data: experiences } = useQuery({
    queryKey: ['experiences', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('experiences').select('*').eq('table_id', Number(id)).order('created_at', { ascending: false })
      if (error) throw error
      return data as Experience[]
    },
  })

  const { data: events } = useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').eq('table_id', Number(id)).order('created_at', { ascending: false })
      if (error) throw error
      return data as Event[]
    },
  })

  const { data: collections } = useQuery({
    queryKey: ['collections', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('collections').select('*').eq('table_id', Number(id)).order('created_at', { ascending: false })
      if (error) throw error
      return data as Collection[]
    },
  })

  const subFilterMap: Record<SuperTab, string> = {
    food: subFilter, drinks: subFilter, misc: subFilter, experiences: subFilter,
  }

  const statusMap: Record<string, string> = {
    'Tried & Loved': 'tried_loved', 'Tried': 'tried', 'Wishlist': 'wishlist',
  }

  // Filter and sort helpers
  const filterDishes = () => {
    let list = dishes ?? []
    if (subFilterMap.food !== 'All') {
      const map: Record<string, Dish['status']> = { Active: 'active', Memory: 'memory_only', Archived: 'archived' }
      list = list.filter(d => d.status === map[subFilterMap.food])
    }
    if (search) list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }

  const filterDrinks = () => {
    let list = drinks ?? []
    const subMap: Record<string, Drink['sub_type']> = {
      Coffee: 'coffee', Wine: 'wine', Beer: 'beer', Spirits: 'spirits',
      Sake: 'sake', Tea: 'tea', 'Non-Alc': 'non_alcoholic',
    }
    if (subFilter !== 'All') list = list.filter(d => d.sub_type === subMap[subFilter])
    if (statusFilter !== 'All') list = list.filter(d => d.status === statusMap[statusFilter])
    if (search) list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    return list
  }

  const filterMisc = () => {
    let list = miscItems ?? []
    const subMap: Record<string, MiscItem['sub_category']> = {
      Snacks: 'snacks', Condiments: 'condiments', 'Instant Noodles': 'instant_noodles', 'Baked Goods': 'baked_goods',
    }
    if (subFilter !== 'All') list = list.filter(m => m.sub_category === subMap[subFilter])
    if (statusFilter !== 'All') list = list.filter(m => m.status === statusMap[statusFilter])
    if (search) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    return list
  }

  const filterExperiences = () => {
    let list = experiences ?? []
    const subMap: Record<string, Experience['sub_category']> = {
      Restaurant: 'restaurant', Café: 'cafe', Travel: 'travel', Cookbook: 'cookbook',
    }
    if (subFilter !== 'All') list = list.filter(e => e.sub_category === subMap[subFilter])
    if (search) list = list.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    return list
  }

  const tabCounts = {
    food: dishes?.length ?? 0,
    drinks: drinks?.length ?? 0,
    misc: miscItems?.length ?? 0,
    experiences: experiences?.length ?? 0,
  }

  const TABS: Array<{ key: SuperTab; label: string }> = [
    { key: 'food', label: `🍽️ Food (${tabCounts.food})` },
    { key: 'drinks', label: `🥂 Drinks (${tabCounts.drinks})` },
    { key: 'misc', label: `🛒 Misc (${tabCounts.misc})` },
    { key: 'experiences', label: `🗺️ Exp (${tabCounts.experiences})` },
  ]

  const newItemPath = {
    food: `/tables/${id}/dishes/new`,
    drinks: `/tables/${id}/drinks/new`,
    misc: `/tables/${id}/misc/new`,
    experiences: `/tables/${id}/experiences/new`,
  }[activeTab]

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

  const handleTabChange = (tab: SuperTab) => {
    setActiveTab(tab)
    setSubFilter('All')
    setStatusFilter('All')
    setSearch('')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="mb-4">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-stone-500 hover:text-forest">← My Tables</button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-forest">{table.name}</h1>
          {table.description && <p className="text-stone-500 mt-1">{table.description}</p>}
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <Link to={`/events/new?tableId=${id}`} className="btn-secondary text-sm">+ New Event</Link>
          <Link to={`/tables/${id}/collections/new`} className="btn-outline text-sm">+ Collection</Link>
        </div>
      </div>

      {/* Super-tab bar */}
      <div className="flex gap-1 mb-4 border-b border-stone-100 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors -mb-px border-b-2 ${
              activeTab === tab.key ? 'border-forest text-forest' : 'border-transparent text-stone-500 hover:text-forest'
            }`}>{tab.label}</button>
        ))}
      </div>

      {/* Sub-filter pills */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {SUB_FILTERS[activeTab].map(f => (
          <button key={f} onClick={() => setSubFilter(f)}
            className={`text-sm px-3 py-1 rounded-full border whitespace-nowrap transition-colors ${
              subFilter === f ? 'bg-forest text-white border-forest' : 'border-stone-200 text-stone-500 hover:border-forest'
            }`}>{f}</button>
        ))}
      </div>

      {/* Status filter + Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {activeTab !== 'food' && (
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                  statusFilter === f ? 'bg-amber text-white border-amber' : 'border-stone-200 text-stone-500 hover:border-amber'
                }`}>{f}</button>
            ))}
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <input type="search" placeholder="Search…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field text-sm py-1.5 w-40" />
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
            className="input-field text-sm py-1.5 w-auto">
            <option value="recent">Recently added</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Content grids */}
      {activeTab === 'food' && (
        <>
          {filterDishes().length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🥘</div>
              <h3 className="font-heading text-lg text-forest mb-2">No dishes yet</h3>
              <p className="text-stone-500 text-sm mb-5">Add your first family recipe to this table.</p>
              <Link to={`/tables/${id}/dishes/new`} className="btn-primary text-sm">Add first dish</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterDishes().map(dish => (
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
                      <h3 className="font-heading text-base font-semibold text-forest group-hover:text-forest-light">{dish.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        dish.status === 'active' ? 'bg-green-100 text-green-700' :
                        dish.status === 'memory_only' ? 'bg-amber/20 text-amber-dark' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {dish.status === 'active' ? 'Active' : dish.status === 'memory_only' ? 'Memory' : 'Archived'}
                      </span>
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
                      <Link to={`/tables/${id}/dishes/${dish.id}/edit`} className="text-xs text-forest hover:underline">Edit</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'drinks' && (
        <>
          {filterDrinks().length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🥂</div>
              <h3 className="font-heading text-lg text-forest mb-2">No drinks yet</h3>
              <p className="text-stone-500 text-sm mb-5">Log your first coffee, wine, or drink.</p>
              <Link to={`/tables/${id}/drinks/new`} className="btn-primary text-sm">Add first drink</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterDrinks().map(drink => <DrinkCard key={drink.id} drink={drink} tableId={Number(id)} />)}
            </div>
          )}
        </>
      )}

      {activeTab === 'misc' && (
        <>
          {filterMisc().length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🛒</div>
              <h3 className="font-heading text-lg text-forest mb-2">No misc items yet</h3>
              <p className="text-stone-500 text-sm mb-5">Add snacks, condiments, or baked goods.</p>
              <Link to={`/tables/${id}/misc/new`} className="btn-primary text-sm">Add first item</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterMisc().map(item => <MiscCard key={item.id} item={item} tableId={Number(id)} />)}
            </div>
          )}
        </>
      )}

      {activeTab === 'experiences' && (
        <>
          {filterExperiences().length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <h3 className="font-heading text-lg text-forest mb-2">No experiences yet</h3>
              <p className="text-stone-500 text-sm mb-5">Log restaurants, cafés, trips, or cookbooks.</p>
              <Link to={`/tables/${id}/experiences/new`} className="btn-primary text-sm">Add first experience</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterExperiences().map(exp => <ExperienceCard key={exp.id} experience={exp} tableId={Number(id)} />)}
            </div>
          )}
        </>
      )}

      {/* Collections section */}
      {(collections ?? []).length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold text-forest">Collections</h2>
            <Link to={`/tables/${id}/collections/new`} className="text-sm text-forest hover:underline">+ New</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections!.map(col => <CollectionCard key={col.id} collection={col} tableId={Number(id)} />)}
          </div>
        </div>
      )}

      {/* Events section (collapsible) */}
      <div className="mt-10">
        <button onClick={() => setEventsOpen(o => !o)}
          className="flex items-center gap-2 text-stone-600 hover:text-forest transition-colors">
          <span className="font-heading text-xl font-semibold">Events ({events?.length ?? 0})</span>
          <span className="text-stone-400 text-lg">{eventsOpen ? '▲' : '▼'}</span>
        </button>

        {eventsOpen && (
          <div className="mt-4 space-y-3">
            {(events ?? []).length === 0 ? (
              <div className="card p-8 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-stone-500 text-sm">No events yet.</p>
                <Link to={`/events/new?tableId=${id}`} className="btn-secondary text-sm mt-4 inline-block">Create event</Link>
              </div>
            ) : (
              (events ?? []).map(event => (
                <Link key={event.id} to={`/events/${event.id}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow block">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-base font-semibold text-forest">{event.name}</h3>
                      <EventStatusBadge status={event.status} />
                    </div>
                    {event.dinner_date && (
                      <p className="text-stone-400 text-xs">Dinner: {new Date(event.dinner_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <span className="text-stone-300 text-lg">→</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating add button */}
      <Link to={newItemPath}
        className="fixed bottom-6 right-6 w-14 h-14 bg-forest text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-forest-light transition-colors z-30">
        +
      </Link>
    </div>
  )
}
