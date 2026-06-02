import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Dish, FoodFundBid } from '../../types'

interface Props {
  eventId: number
  guestName: string
  enabled: boolean
  threshold: number | null
  nonShortlistDishes: Dish[]
}

interface BidTotal {
  dish_id: number
  total: number
}

export default function FoodFund({ eventId, guestName, enabled, threshold, nonShortlistDishes }: Props) {
  const qc = useQueryClient()
  const [selectedDish, setSelectedDish] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  const { data: bids } = useQuery({
    queryKey: ['food-fund', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_fund_bids')
        .select('*')
        .eq('event_id', eventId)
      if (error) throw error
      return data as FoodFundBid[]
    },
  })

  const totals: BidTotal[] = nonShortlistDishes.map(dish => ({
    dish_id: dish.id,
    total: bids?.filter(b => b.dish_id === dish.id).reduce((s, b) => s + b.amount, 0) ?? 0,
  }))

  const bidMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDish || !amount) throw new Error('Select a dish and enter an amount')
      const { error } = await supabase.from('food_fund_bids').insert({
        event_id: eventId,
        dish_id: selectedDish,
        guest_name: guestName,
        amount: Number(amount),
        message: message || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['food-fund', eventId] })
      setAmount('')
      setMessage('')
      setSelectedDish(null)
      setSubmitError('')
    },
    onError: (e) => setSubmitError(e.message),
  })

  if (!enabled) return (
    <div className="text-center py-10 text-stone-400 text-sm">Food Fund not enabled for this event.</div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-forest mb-1">Food Fund</h2>
        <p className="text-stone-500 text-sm">
          Pledge money towards a dish you'd love to see on the menu.
          {threshold && ` Once a dish reaches $${threshold}, the host considers it!`}
        </p>
      </div>

      {nonShortlistDishes.length === 0 ? (
        <div className="card p-8 text-center text-stone-400 text-sm">No dishes available to fund.</div>
      ) : (
        <>
          {/* Bid totals */}
          <div className="space-y-3">
            {nonShortlistDishes.map(dish => {
              const total = totals.find(t => t.dish_id === dish.id)?.total ?? 0
              const pct = threshold ? Math.min(100, Math.round((total / threshold) * 100)) : 0
              return (
                <button
                  key={dish.id}
                  onClick={() => setSelectedDish(dish.id === selectedDish ? null : dish.id)}
                  className={`card w-full p-4 text-left transition-all hover:shadow-md ${selectedDish === dish.id ? 'ring-2 ring-amber' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-stone-800 text-sm">{dish.name}</span>
                    <span className="text-amber-dark font-semibold text-sm">${total.toFixed(2)}</span>
                  </div>
                  {threshold && (
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Bid form */}
          {selectedDish !== null && (
            <div className="card p-5 space-y-3">
              <h3 className="font-heading text-base font-semibold text-forest">
                Pledge for: {nonShortlistDishes.find(d => d.id === selectedDish)?.name}
              </h3>
              <div>
                <label className="label text-xs">Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 10"
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label text-xs">Message (optional)</label>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="input-field"
                  placeholder="Why do you love this dish?"
                />
              </div>
              {submitError && <p className="text-red-500 text-xs">{submitError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setSelectedDish(null)} className="btn-outline text-sm flex-1">Cancel</button>
                <button
                  onClick={() => bidMutation.mutate()}
                  disabled={!amount || Number(amount) <= 0 || bidMutation.isPending}
                  className="btn-secondary text-sm flex-1"
                >
                  {bidMutation.isPending ? 'Pledging…' : 'Pledge'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
