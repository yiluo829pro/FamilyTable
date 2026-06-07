import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Dish, WishlistItem } from '../../types'

interface Props {
  eventId: number
  guestName: string
  allDishes: Dish[]
  shortlistIds: number[]
}

const CATEGORIES = ['dish', 'drink', 'snack', 'game', 'other'] as const
type Cat = typeof CATEGORIES[number]
const CAT_EMOJI: Record<Cat, string> = { dish: '🍽️', drink: '🥤', snack: '🍿', game: '🎲', other: '📦' }

export default function WishlistPanel({ eventId, guestName, allDishes, shortlistIds }: Props) {
  const qc = useQueryClient()
  const nonShortlist = allDishes.filter(d => !shortlistIds.includes(d.id))
  const [customItem, setCustomItem] = useState('')
  const [category, setCategory] = useState<Cat>('dish')
  const [note, setNote] = useState('')
  const [tab, setTab] = useState<'library' | 'custom'>('library')

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist', eventId, guestName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('event_id', eventId)
        .eq('guest_name', guestName)
      if (error) throw error
      return data as WishlistItem[]
    },
  })

  const addMutation = useMutation({
    mutationFn: async (item: { dish_id?: number; item_name: string; category: Cat; note?: string }) => {
      const { error } = await supabase.from('wishlist_items').insert({
        event_id: eventId,
        guest_name: guestName,
        dish_id: item.dish_id ?? null,
        item_name: item.item_name,
        category: item.category,
        note: item.note || null,
        will_bring: false,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist', eventId, guestName] })
      setCustomItem('')
      setNote('')
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist', eventId, guestName] }),
  })

  const wishedDishIds = new Set(wishlist?.map(w => w.dish_id).filter(Boolean))

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold text-forest mb-1">Your Wishlist</h2>
        <p className="text-stone-500 text-sm">Add dishes or items you'd love to see at the dinner.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-100">
        {(['library', 'custom'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize -mb-px border-b-2 transition-colors ${
              tab === t ? 'border-forest text-forest' : 'border-transparent text-stone-500'
            }`}
          >
            {t === 'library' ? 'From Library' : 'Custom Item'}
          </button>
        ))}
      </div>

      {tab === 'library' && (
        nonShortlist.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-4">All dishes are already on the shortlist.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {nonShortlist.map(dish => {
              const inWishlist = wishedDishIds.has(dish.id)
              return (
                <button
                  key={dish.id}
                  onClick={() => !inWishlist && addMutation.mutate({ dish_id: dish.id, item_name: dish.name, category: 'dish' })}
                  className={`card p-3 text-left transition-all ${inWishlist ? 'ring-2 ring-amber opacity-75' : 'hover:shadow-md cursor-pointer'}`}
                >
                  <div className="h-20 bg-gradient-to-br from-amber/10 to-forest/10 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
                    {dish.photos?.[0] ? (
                      <img src={dish.photos[0]} alt={dish.name} className="w-full h-full object-cover rounded-xl" />
                    ) : <span className="text-3xl">🍲</span>}
                  </div>
                  <p className="text-xs font-medium text-stone-700 line-clamp-2">{dish.name}</p>
                  {inWishlist && <p className="text-xs text-amber-dark mt-1">✓ In wishlist</p>}
                </button>
              )
            })}
          </div>
        )
      )}

      {tab === 'custom' && (
        <div className="card p-4 space-y-3">
          <input
            type="text"
            value={customItem}
            onChange={e => setCustomItem(e.target.value)}
            className="input-field"
            placeholder="What would you love to see?"
          />
          <select value={category} onChange={e => setCategory(e.target.value as Cat)} className="input-field">
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
          </select>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="input-field"
            placeholder="Note (optional)"
          />
          <button
            onClick={() => addMutation.mutate({ item_name: customItem, category, note })}
            disabled={!customItem.trim() || addMutation.isPending}
            className="btn-primary w-full text-sm"
          >
            {addMutation.isPending ? 'Adding…' : 'Add to Wishlist'}
          </button>
        </div>
      )}

      {/* Wishlist items */}
      {wishlist && wishlist.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-stone-600 mb-2">Your wishlist ({wishlist.length})</h3>
          <div className="space-y-2">
            {wishlist.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 shadow-sm border border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">{CAT_EMOJI[item.category as Cat] ?? '📦'}</span>
                  <div>
                    <p className="text-sm text-stone-700">{item.item_name}</p>
                    {item.note && <p className="text-xs text-stone-400">{item.note}</p>}
                  </div>
                </div>
                <button
                  onClick={() => removeMutation.mutate(item.id)}
                  className="text-stone-300 hover:text-red-400 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
