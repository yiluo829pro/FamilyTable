import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useEvent, useEventDishes } from '../../hooks/useEvent'
import { useRealtimeVotes } from '../../hooks/useRealtimeVotes'
import type { GuestPreference, PotluckItem, FoodFundBid, Dish } from '../../types'

type StatusOption = 'draft' | 'live' | 'voting_closed' | 'menu_announced' | 'archived'
const STATUS_FLOW: StatusOption[] = ['draft', 'live', 'voting_closed', 'menu_announced', 'archived']
const STATUS_LABELS: Record<StatusOption, string> = {
  draft: 'Draft', live: 'Live', voting_closed: 'Voting Closed',
  menu_announced: 'Menu Announced', archived: 'Archived',
}

function nextStatus(current: StatusOption): StatusOption | null {
  const idx = STATUS_FLOW.indexOf(current)
  return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
}

export default function EventAdmin() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeSection, setActiveSection] = useState<'results' | 'potluck' | 'fund' | 'allergies'>('results')

  const { data: event, isLoading } = useEvent(id)
  const { data: dishes } = useEventDishes(event)
  const { voteCounts } = useRealtimeVotes(event?.id ?? null)

  const { data: preferences } = useQuery({
    queryKey: ['preferences', event?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guest_preferences')
        .select('*')
        .eq('event_id', event!.id)
      if (error) throw error
      return data as GuestPreference[]
    },
    enabled: !!event,
  })

  const { data: potluckItems } = useQuery({
    queryKey: ['potluck', event?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('potluck_items').select('*').eq('event_id', event!.id).order('created_at')
      if (error) throw error
      return data as PotluckItem[]
    },
    enabled: !!event,
  })

  const { data: foodFundBids } = useQuery({
    queryKey: ['food-fund', event?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('food_fund_bids').select('*').eq('event_id', event!.id)
      if (error) throw error
      return data as FoodFundBid[]
    },
    enabled: !!event,
  })

  const statusMutation = useMutation({
    mutationFn: async (newStatus: StatusOption) => {
      const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', event!.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event', id] }),
  })

  const finalMenuMutation = useMutation({
    mutationFn: async (dishId: number) => {
      const current = event?.final_menu_dish_ids ?? []
      const updated = current.includes(dishId) ? current.filter(d => d !== dishId) : [...current, dishId]
      const { error } = await supabase.from('events').update({ final_menu_dish_ids: updated }).eq('id', event!.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event', id] }),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )
  if (!event) return <div className="text-center py-10 text-stone-500">Event not found.</div>

  const sortedDishes = [...(dishes ?? [])]
    .filter(d => event.shortlist_dish_ids.includes(d.id))
    .sort((a, b) => {
      const va = voteCounts.find(v => v.dish_id === a.id)?.count ?? 0
      const vb = voteCounts.find(v => v.dish_id === b.id)?.count ?? 0
      return vb - va
    })

  const totalVotes = voteCounts.reduce((s, v) => s + v.count, 0)
  const uniqueGuests = new Set([...(preferences?.map(p => p.guest_name) ?? [])]).size
  const allergyCount = preferences?.filter(p => p.allergies.length > 0).length ?? 0
  const potluckClaimed = potluckItems?.filter(p => p.status !== 'open').length ?? 0
  const fundTotal = foodFundBids?.reduce((s, b) => s + b.amount, 0) ?? 0
  const next = nextStatus(event.status)

  const getDishName = (id: number) => dishes?.find(d => d.id === id)?.name ?? `Dish #${id}`

  // Fund totals per dish
  const fundByDish: Record<number, number> = {}
  foodFundBids?.forEach(b => { fundByDish[b.dish_id] = (fundByDish[b.dish_id] ?? 0) + b.amount })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-stone-500 hover:text-forest">← Back</button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-forest">{event.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{STATUS_LABELS[event.status]}</span>
            {event.dinner_date && (
              <span className="text-stone-400 text-xs">🗓 {new Date(event.dinner_date).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to={`/vote/${event.slug}`}
            target="_blank"
            className="btn-outline text-sm"
          >
            🔗 Guest Link
          </Link>
          <Link to={`/events/${id}/broadcast`} className="btn-secondary text-sm">
            📢 Broadcast Menu
          </Link>
          {next && (
            <button
              onClick={() => statusMutation.mutate(next)}
              disabled={statusMutation.isPending}
              className="btn-primary text-sm"
            >
              → {STATUS_LABELS[next]}
            </button>
          )}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Votes', value: totalVotes, icon: '🗳️' },
          { label: 'Guests', value: uniqueGuests, icon: '👥' },
          { label: 'Allergy Reports', value: allergyCount, icon: '⚠️' },
          { label: 'Potluck Claimed', value: `${potluckClaimed}/${potluckItems?.length ?? 0}`, icon: '🤝' },
        ].map(m => (
          <div key={m.label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{m.icon}</div>
            <div className="font-heading text-2xl font-bold text-forest">{m.value}</div>
            <div className="text-xs text-stone-400 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Section nav */}
      <div className="flex gap-1 mb-6 border-b border-stone-100 overflow-x-auto">
        {(['results', 'potluck', 'fund', 'allergies'] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2.5 text-sm font-medium capitalize whitespace-nowrap -mb-px border-b-2 transition-colors ${
              activeSection === s ? 'border-forest text-forest' : 'border-transparent text-stone-500'
            }`}
          >
            {s === 'fund' ? 'Food Fund' : s === 'allergies' ? 'Allergies' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Results */}
      {activeSection === 'results' && (
        <div className="space-y-3">
          <p className="text-stone-500 text-sm mb-4">Click "Add to Menu" to build the final menu. <strong>{event.final_menu_dish_ids.length}</strong> dishes selected.</p>
          {sortedDishes.map((dish, i) => {
            const vc = voteCounts.find(v => v.dish_id === dish.id)?.count ?? 0
            const pct = totalVotes > 0 ? Math.round((vc / totalVotes) * 100) : 0
            const onMenu = event.final_menu_dish_ids.includes(dish.id)
            return (
              <div key={dish.id} className={`card p-4 flex items-center gap-4 ${onMenu ? 'ring-2 ring-forest' : ''}`}>
                <span className="text-stone-300 font-heading text-xl w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-800">{dish.name}</p>
                    {onMenu && <span className="text-xs bg-forest text-white px-2 py-0.5 rounded-full">On Menu ✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-forest transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-stone-400 w-16 text-right">{vc} votes ({pct}%)</span>
                  </div>
                </div>
                <button
                  onClick={() => finalMenuMutation.mutate(dish.id)}
                  disabled={finalMenuMutation.isPending}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 ${
                    onMenu
                      ? 'bg-forest/10 text-forest hover:bg-red-50 hover:text-red-500'
                      : 'bg-amber/20 text-amber-dark hover:bg-amber/30'
                  }`}
                >
                  {onMenu ? 'Remove' : 'Add to Menu'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Potluck */}
      {activeSection === 'potluck' && (
        <div>
          {!event.potluck_enabled && <p className="text-stone-400 text-sm">Potluck not enabled.</p>}
          {event.potluck_enabled && potluckItems && (
            <div className="space-y-2">
              {potluckItems.length === 0 && <p className="text-stone-400 text-sm">No potluck items yet.</p>}
              {potluckItems.map(item => (
                <div key={item.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-800 text-sm">{item.item_name}</p>
                    <p className="text-stone-400 text-xs capitalize">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'open' ? 'bg-stone-100 text-stone-500' :
                      item.status === 'claimed' ? 'bg-amber/20 text-amber-dark' :
                      'bg-green-100 text-green-700'
                    }`}>{item.status}</span>
                    {item.claimed_by && <p className="text-xs text-stone-400 mt-0.5">{item.claimed_by}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Food Fund */}
      {activeSection === 'fund' && (
        <div>
          {!event.food_fund_enabled && <p className="text-stone-400 text-sm">Food Fund not enabled.</p>}
          {event.food_fund_enabled && (
            <>
              <div className="card p-4 mb-4 bg-amber/5">
                <p className="font-heading text-lg font-semibold text-forest">Total raised: <span className="text-amber-dark">${fundTotal.toFixed(2)}</span></p>
                {event.food_fund_threshold && (
                  <p className="text-stone-400 text-sm">Threshold: ${event.food_fund_threshold}</p>
                )}
              </div>
              {Object.entries(fundByDish).map(([dishId, total]) => (
                <div key={dishId} className="card p-4 mb-2 flex items-center justify-between">
                  <p className="text-stone-700 text-sm font-medium">{getDishName(Number(dishId))}</p>
                  <span className="text-amber-dark font-semibold">${(total as number).toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(fundByDish).length === 0 && <p className="text-stone-400 text-sm">No bids yet.</p>}
            </>
          )}
        </div>
      )}

      {/* Allergies */}
      {activeSection === 'allergies' && (
        <div>
          <p className="text-stone-500 text-sm mb-4">Private — visible only to admins/co-managers.</p>
          {(!preferences || preferences.length === 0) && (
            <p className="text-stone-400 text-sm">No preferences submitted yet.</p>
          )}
          {preferences && preferences.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left">
                    <th className="pb-2 text-stone-500 font-medium">Guest</th>
                    <th className="pb-2 text-stone-500 font-medium">Allergies</th>
                    <th className="pb-2 text-stone-500 font-medium">Dietary</th>
                    <th className="pb-2 text-stone-500 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {preferences.map(p => (
                    <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                      <td className="py-2 font-medium text-stone-700">{p.guest_name}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {p.allergies.map(a => (
                            <span key={a} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{a}</span>
                          ))}
                          {p.allergies.length === 0 && <span className="text-stone-300 text-xs">None</span>}
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {p.dietary_notes.map(d => (
                            <span key={d} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{d}</span>
                          ))}
                          {p.dietary_notes.length === 0 && <span className="text-stone-300 text-xs">None</span>}
                        </div>
                      </td>
                      <td className="py-2 text-stone-400 text-xs">{p.free_text ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
