import { useState } from 'react'
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
    <Link to={`/tables/${table.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100">
      {/* Photo — fixed 16:9, never overlaid */}
      <div className="aspect-video overflow-hidden bg-stone-50">
        {table.cover_photo_url ? (
          <img src={table.cover_photo_url} alt={table.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl opacity-20">🍽️</span>
            <span className="text-xs text-stone-300">No cover photo</span>
          </div>
        )}
      </div>

      {/* Content block — always on white, never on photo */}
      <div className="px-4 pt-3 pb-4 space-y-2">
        <h3 className="font-heading text-lg font-semibold text-forest leading-snug group-hover:text-forest/80 transition-colors">
          {table.name}
        </h3>
        {table.description && (
          <p className="text-stone-400 text-sm line-clamp-1">{table.description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          {counts ? (
            <div className="flex gap-3 text-xs text-stone-500">
              {counts.food > 0 && <span className="flex items-center gap-1"><span>🍽️</span>{counts.food} dishes</span>}
              {counts.drinks > 0 && <span className="flex items-center gap-1"><span>🥂</span>{counts.drinks} drinks</span>}
              {counts.misc > 0 && <span className="flex items-center gap-1"><span>🛒</span>{counts.misc} misc</span>}
              {counts.food + counts.drinks + counts.misc === 0 && <span className="text-stone-300">No items yet</span>}
            </div>
          ) : <span />}
          <span className="text-xs text-stone-300">{new Date(table.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  const [inviteCode, setInviteCode] = useState('')

  const handleJoin = () => {
    const trimmed = inviteCode.trim()
    if (!trimmed) return
    // Support pasting a full URL or just the token
    const match = trimmed.match(/\/invite\/(.+)$/)
    const token = match ? match[1] : trimmed
    window.location.href = `/invite/${token}`
  }

  return (
    <div className="max-w-lg mx-auto mt-12 space-y-4">
      {/* Create */}
      <div className="card p-8 text-center">
        <div className="text-5xl mb-4">🍽️</div>
        <h2 className="font-heading text-xl font-semibold text-forest mb-2">Start your Family Table</h2>
        <p className="text-stone-500 text-sm mb-6">
          Create a Table for your family — a place to collect food memories, drinks, favourite spots, and plan dinner parties.
        </p>
        <Link to="/tables/new" className="btn-primary w-full block text-center">+ Create a Table</Link>
      </div>

      {/* Join */}
      <div className="card p-8">
        <h3 className="font-heading text-lg font-semibold text-forest mb-1">Join a Table</h3>
        <p className="text-stone-500 text-sm mb-4">
          Have an invite link from a family member? Paste it below.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            className="input-field flex-1"
            placeholder="Paste invite link or code…"
          />
          <button onClick={handleJoin} disabled={!inviteCode.trim()} className="btn-primary px-4 disabled:opacity-40">
            Join
          </button>
        </div>
        <p className="text-stone-400 text-xs mt-3">
          No invite yet? Ask your family admin to send you one from their Table settings.
        </p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tables').select('*').order('created_at', { ascending: false })
      // Treat errors as empty — new users with no tables may hit RLS returning nothing
      if (error) return [] as FamilyTable[]
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
        {tables && tables.length > 0 && (
          <Link to="/tables/new" className="btn-primary">+ New Table</Link>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
        </div>
      )}

      {!isLoading && tables && tables.length === 0 && <EmptyState />}

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
