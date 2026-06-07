import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { FamilyTable } from '../types'

interface TableCounts {
  food: number
  drinks: number
  misc: number
  experiences: number
}

async function fetchTableCounts(tableId: number): Promise<TableCounts> {
  const [dishes, drinks, misc, experiences] = await Promise.all([
    supabase.from('dishes').select('id', { count: 'exact', head: true }).eq('table_id', tableId),
    supabase.from('drinks').select('id', { count: 'exact', head: true }).eq('table_id', tableId),
    supabase.from('misc_items').select('id', { count: 'exact', head: true }).eq('table_id', tableId),
    supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('table_id', tableId),
  ])
  return {
    food: dishes.count ?? 0,
    drinks: drinks.count ?? 0,
    misc: misc.count ?? 0,
    experiences: experiences.count ?? 0,
  }
}

function TableCard({ table }: { table: FamilyTable }) {
  const { data: counts } = useQuery({
    queryKey: ['table_counts', table.id],
    queryFn: () => fetchTableCounts(table.id),
  })

  return (
    <Link to={`/tables/${table.id}`} className="card hover:shadow-md transition-shadow group block">
      <div className="h-32 bg-gradient-to-br from-forest/10 to-amber/10 flex items-center justify-center rounded-t-2xl overflow-hidden">
        {table.cover_photo_url ? (
          <img src={table.cover_photo_url} alt={table.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🍽️</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-forest group-hover:text-forest-light transition-colors">
          {table.name}
        </h3>
        {table.description && (
          <p className="text-stone-500 text-sm mt-1 line-clamp-2">{table.description}</p>
        )}
        {counts && (
          <div className="flex flex-wrap gap-2 mt-3">
            {counts.food > 0 && <span className="text-xs bg-amber/10 text-amber-dark px-2 py-0.5 rounded-full">🍽️ {counts.food} food</span>}
            {counts.drinks > 0 && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">🥂 {counts.drinks} drinks</span>}
            {counts.misc > 0 && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">🛒 {counts.misc} misc</span>}
            {counts.experiences > 0 && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">🗺️ {counts.experiences} exp</span>}
            {counts.food + counts.drinks + counts.misc + counts.experiences === 0 && (
              <span className="text-xs text-stone-400">No items yet</span>
            )}
          </div>
        )}
        <p className="text-stone-400 text-xs mt-3">
          Created {new Date(table.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()

  const { data: tables, isLoading, error } = useQuery({
    queryKey: ['tables', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tables').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as FamilyTable[]
    },
    enabled: !!user,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-forest">My Tables</h1>
          <p className="text-stone-500 mt-1">Your family food circles</p>
        </div>
        <Link to="/tables/new" className="btn-primary">+ New Table</Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
        </div>
      )}

      {error && (
        <div className="card p-6 text-center text-red-500">
          Failed to load tables. Please try refreshing.
        </div>
      )}

      {!isLoading && !error && tables && tables.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="font-heading text-xl font-semibold text-forest mb-2">No tables yet</h2>
          <p className="text-stone-500 mb-6 text-sm">Create your first family table to start collecting food memories.</p>
          <Link to="/tables/new" className="btn-primary">Create your first table</Link>
        </div>
      )}

      {tables && tables.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map(table => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      )}
    </div>
  )
}
