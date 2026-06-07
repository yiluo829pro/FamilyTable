import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { Dish, Drink, MiscItem, Experience } from '../../types'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 7)
}

type ItemType = 'dish' | 'drink' | 'misc' | 'experience'
interface SelectedItem { item_type: ItemType; item_id: number; name: string }

export default function NewCollection() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'private' | 'shared'>('private')
  const [selected, setSelected] = useState<SelectedItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: dishes } = useQuery({
    queryKey: ['dishes', id], queryFn: async () => {
      const { data } = await supabase.from('dishes').select('id,name').eq('table_id', Number(id))
      return (data ?? []) as Pick<Dish, 'id' | 'name'>[]
    }
  })
  const { data: drinks } = useQuery({
    queryKey: ['drinks', id], queryFn: async () => {
      const { data } = await supabase.from('drinks').select('id,name').eq('table_id', Number(id))
      return (data ?? []) as Pick<Drink, 'id' | 'name'>[]
    }
  })
  const { data: miscItems } = useQuery({
    queryKey: ['misc_items', id], queryFn: async () => {
      const { data } = await supabase.from('misc_items').select('id,name').eq('table_id', Number(id))
      return (data ?? []) as Pick<MiscItem, 'id' | 'name'>[]
    }
  })
  const { data: experiences } = useQuery({
    queryKey: ['experiences', id], queryFn: async () => {
      const { data } = await supabase.from('experiences').select('id,name').eq('table_id', Number(id))
      return (data ?? []) as Pick<Experience, 'id' | 'name'>[]
    }
  })

  type AllItem = { item_type: ItemType; item_id: number; name: string }
  const allItems: AllItem[] = [
    ...(dishes ?? []).map(d => ({ item_type: 'dish' as ItemType, item_id: d.id, name: d.name })),
    ...(drinks ?? []).map(d => ({ item_type: 'drink' as ItemType, item_id: d.id, name: d.name })),
    ...(miscItems ?? []).map(m => ({ item_type: 'misc' as ItemType, item_id: m.id, name: m.name })),
    ...(experiences ?? []).map(e => ({ item_type: 'experience' as ItemType, item_id: e.id, name: e.name })),
  ]

  const filtered = allItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) &&
    !selected.some(s => s.item_type === item.item_type && s.item_id === item.item_id)
  )

  const addItem = (item: AllItem) => setSelected(s => [...s, item])
  const removeItem = (item_type: ItemType, item_id: number) =>
    setSelected(s => s.filter(x => !(x.item_type === item_type && x.item_id === item_id)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return
    setLoading(true)
    setError('')
    try {
      const { data: col, error: colErr } = await supabase.from('collections').insert({
        table_id: Number(id),
        name,
        description: description || null,
        slug: slugify(name),
        privacy,
        created_by: user.id,
      }).select().single()
      if (colErr) throw colErr

      if (selected.length > 0) {
        const items = selected.map((item, idx) => ({
          collection_id: col.id,
          item_type: item.item_type,
          item_id: item.item_id,
          sort_order: idx,
        }))
        const { error: itemsErr } = await supabase.from('collection_items').insert(items)
        if (itemsErr) throw itemsErr
      }

      navigate(`/tables/${id}/collections/${col.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const typeLabel: Record<ItemType, string> = { dish: '🍽️', drink: '🥂', misc: '🛒', experience: '🗺️' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <button onClick={() => navigate(`/tables/${id}`)} className="text-sm text-stone-500 hover:text-forest">
          ← Back to Table
        </button>
      </div>
      <div className="card p-8">
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">New Collection</h1>
        <p className="text-stone-500 text-sm mb-6">Curate a collection of items to share or remember.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Collection Name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              className="input-field" placeholder="e.g. Best Ramen Spots" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="input-field min-h-[80px] resize-y" placeholder="What's this collection about?" />
          </div>
          <div>
            <label className="label">Privacy</label>
            <div className="flex gap-3">
              {(['private', 'shared'] as const).map(p => (
                <button key={p} type="button" onClick={() => setPrivacy(p)}
                  className={`text-sm px-4 py-2 rounded-xl border capitalize transition-colors ${
                    privacy === p ? 'bg-forest text-white border-forest' : 'border-stone-200 text-stone-600 hover:border-forest'
                  }`}>
                  {p === 'private' ? '🔒 Private' : '🌐 Shared (public link)'}
                </button>
              ))}
            </div>
          </div>

          {/* Item picker */}
          <div>
            <label className="label">Add Items</label>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="input-field mb-3" placeholder="Search items…" />
            {selected.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-stone-500 mb-2">Selected ({selected.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selected.map(item => (
                    <span key={`${item.item_type}-${item.item_id}`}
                      className="flex items-center gap-1 bg-forest/10 text-forest text-sm px-3 py-1 rounded-full">
                      {typeLabel[item.item_type]} {item.name}
                      <button type="button" onClick={() => removeItem(item.item_type, item.item_id)}
                        className="ml-1 hover:text-red-500 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="max-h-48 overflow-y-auto border border-stone-100 rounded-xl">
              {filtered.slice(0, 30).map(item => (
                <button key={`${item.item_type}-${item.item_id}`} type="button"
                  onClick={() => addItem(item)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-cream flex items-center gap-2">
                  <span>{typeLabel[item.item_type]}</span>
                  <span className="text-stone-700">{item.name}</span>
                  <span className="text-stone-400 text-xs capitalize ml-auto">{item.item_type}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-sm text-stone-400">No items found</p>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating…' : 'Create Collection'}
          </button>
        </form>
      </div>
    </div>
  )
}
