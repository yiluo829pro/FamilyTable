import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { PotluckItem } from '../../types'

interface Props {
  eventId: number
  guestName: string
  enabled: boolean
}

const CATEGORIES = ['dish', 'drink', 'snack', 'game', 'other']

export default function PotluckBoard({ eventId, guestName, enabled }: Props) {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState('dish')

  const { data: items, isLoading } = useQuery({
    queryKey: ['potluck', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('potluck_items')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at')
      if (error) throw error
      return data as PotluckItem[]
    },
  })

  const claimMutation = useMutation({
    mutationFn: async (item: PotluckItem) => {
      const isMine = item.claimed_by === guestName
      const { error } = await supabase
        .from('potluck_items')
        .update({
          claimed_by: isMine ? null : guestName,
          status: isMine ? 'open' : 'claimed',
        })
        .eq('id', item.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['potluck', eventId] }),
  })

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('potluck_items').insert({
        event_id: eventId,
        item_name: newItem,
        category: newCategory,
        added_by_host: false,
        status: 'open',
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['potluck', eventId] })
      setNewItem('')
      setNewCategory('dish')
      setAdding(false)
    },
  })

  if (!enabled) return (
    <div className="text-center py-10 text-stone-400 text-sm">Potluck not enabled for this event.</div>
  )

  const categoryEmoji: Record<string, string> = { dish: '🍽️', drink: '🥤', snack: '🍿', game: '🎲', other: '📦' }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-forest">Potluck Board</h2>
        <button onClick={() => setAdding(a => !a)} className="btn-primary text-sm">
          + Add item
        </button>
      </div>

      {adding && (
        <div className="card p-4 space-y-3">
          <input
            type="text"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            placeholder="What will you bring?"
            className="input-field"
          />
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="input-field">
            {CATEGORIES.map(c => <option key={c} value={c}>{categoryEmoji[c]} {c}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="btn-outline text-sm flex-1">Cancel</button>
            <button
              onClick={() => addMutation.mutate()}
              disabled={!newItem.trim() || addMutation.isPending}
              className="btn-primary text-sm flex-1"
            >
              {addMutation.isPending ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div></div>}

      {items && items.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-2">🤝</div>
          <p className="text-stone-500 text-sm">No potluck items yet. Add something to bring!</p>
        </div>
      )}

      {items && items.map(item => {
        const isMine = item.claimed_by === guestName
        const isClaimed = item.status !== 'open' && !isMine
        return (
          <div key={item.id} className={`card p-4 flex items-center justify-between gap-3 ${isClaimed ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{categoryEmoji[item.category] ?? '📦'}</span>
              <div>
                <p className="font-medium text-stone-800 text-sm">{item.item_name}</p>
                <p className="text-xs text-stone-400 capitalize">{item.category}</p>
                {item.claimed_by && (
                  <p className="text-xs text-forest mt-0.5">
                    {isMine ? '✓ You claimed this' : `Claimed by ${item.claimed_by}`}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => claimMutation.mutate(item)}
              disabled={isClaimed || claimMutation.isPending}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isMine
                  ? 'bg-forest/10 text-forest hover:bg-forest/20'
                  : isClaimed
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : 'bg-amber/20 text-amber-dark hover:bg-amber/30'
              }`}
            >
              {isMine ? 'Unclaim' : isClaimed ? 'Claimed' : 'Claim'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
