import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'

interface SearchResult {
  type: 'dish' | 'drink' | 'misc' | 'experience'
  id: number
  name: string
  table_id: number
}

export default function Navbar() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const performSearch = async (q: string) => {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); return }

    const pattern = `%${q}%`
    const [dishes, drinks, misc, experiences] = await Promise.all([
      supabase.from('dishes').select('id,name,table_id').ilike('name', pattern).limit(5),
      supabase.from('drinks').select('id,name,table_id').ilike('name', pattern).limit(5),
      supabase.from('misc_items').select('id,name,table_id').ilike('name', pattern).limit(5),
      supabase.from('experiences').select('id,name,table_id').ilike('name', pattern).limit(5),
    ])

    const results: SearchResult[] = [
      ...(dishes.data ?? []).map(d => ({ type: 'dish' as const, id: d.id, name: d.name, table_id: d.table_id })),
      ...(drinks.data ?? []).map(d => ({ type: 'drink' as const, id: d.id, name: d.name, table_id: d.table_id })),
      ...(misc.data ?? []).map(m => ({ type: 'misc' as const, id: m.id, name: m.name, table_id: m.table_id })),
      ...(experiences.data ?? []).map(e => ({ type: 'experience' as const, id: e.id, name: e.name, table_id: e.table_id })),
    ]
    setSearchResults(results)
    setSearchOpen(true)
  }

  const typeEmoji: Record<string, string> = { dish: '🍽️', drink: '🥂', misc: '🛒', experience: '🗺️' }
  const typeEditPath = (r: SearchResult) => {
    if (r.type === 'dish') return `/tables/${r.table_id}/dishes/${r.id}/edit`
    if (r.type === 'drink') return `/tables/${r.table_id}/drinks/${r.id}/edit`
    if (r.type === 'misc') return `/tables/${r.table_id}/misc/${r.id}/edit`
    return `/tables/${r.table_id}/experiences/${r.id}/edit`
  }

  return (
    <nav className="bg-white border-b border-stone-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
          <span className="text-2xl">🍽️</span>
          <span className="font-heading text-xl font-semibold text-forest group-hover:text-forest-light transition-colors hidden sm:block">
            Family Table
          </span>
        </Link>

        {/* Desktop search */}
        {user && (
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <input
              type="search"
              placeholder="Search all items…"
              value={searchQuery}
              onChange={e => performSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              className="input-field text-sm py-2 w-full pl-9"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                {searchResults.map(r => (
                  <Link key={`${r.type}-${r.id}`} to={typeEditPath(r)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-cream transition-colors">
                    <span>{typeEmoji[r.type]}</span>
                    <span className="text-stone-700">{r.name}</span>
                    <span className="text-stone-400 text-xs capitalize ml-auto">{r.type}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Mobile search toggle */}
          {user && (
            <button onClick={() => setMobileSearchOpen(o => !o)} className="sm:hidden text-stone-500 hover:text-forest text-lg">
              🔍
            </button>
          )}

          {user && (
            <>
              <Link to="/dashboard" className="text-sm text-stone-600 hover:text-forest transition-colors font-medium hidden sm:block">
                My Tables
              </Link>
              <span className="text-stone-300 hidden sm:block">|</span>
              <span className="text-sm text-stone-500 truncate max-w-[120px] hidden md:block">{user.email}</span>
              <button onClick={handleSignOut} className="text-sm text-stone-500 hover:text-red-500 transition-colors">
                Sign out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      {user && mobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 bg-white border-b border-stone-100">
          <div className="relative">
            <input
              type="search"
              placeholder="Search all items…"
              value={searchQuery}
              autoFocus
              onChange={e => performSearch(e.target.value)}
              className="input-field text-sm py-2 w-full pl-9"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-1 bg-white border border-stone-200 rounded-xl shadow max-h-48 overflow-y-auto">
              {searchResults.map(r => (
                <Link key={`${r.type}-${r.id}`} to={typeEditPath(r)}
                  onClick={() => setMobileSearchOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-cream transition-colors">
                  <span>{typeEmoji[r.type]}</span>
                  <span className="text-stone-700">{r.name}</span>
                  <span className="text-stone-400 text-xs capitalize ml-auto">{r.type}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
