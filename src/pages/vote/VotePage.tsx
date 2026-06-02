import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useEvent } from '../../hooks/useEvent'
import { useRealtimeVotes } from '../../hooks/useRealtimeVotes'
import VoteCard from '../../components/vote/VoteCard'
import PotluckBoard from '../../components/vote/PotluckBoard'
import FoodFund from '../../components/vote/FoodFund'
import PreferencesForm from '../../components/vote/PreferencesForm'
import WishlistPanel from '../../components/vote/WishlistPanel'
import type { Dish } from '../../types'

const TABS = ['vote', 'browse', 'potluck', 'food-fund', 'preferences'] as const
type Tab = typeof TABS[number]
const TAB_LABELS: Record<Tab, string> = {
  vote: '🗳️ Vote',
  browse: '📚 Browse',
  potluck: '🤝 Potluck',
  'food-fund': '💰 Food Fund',
  preferences: '🥗 Prefs',
}

function NameModal({ slug, onName }: { slug: string; onName: (name: string) => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name'); return }
    sessionStorage.setItem(`guest_name_${slug}`, trimmed)
    onName(trimmed)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl sm:rounded-2xl rounded-b-none sm:max-w-sm w-full p-6">
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🍽️</div>
          <h2 className="font-heading text-xl font-semibold text-forest">Welcome!</h2>
          <p className="text-stone-500 text-sm mt-1">What's your name? (So the host knows who voted.)</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
            placeholder="Your name"
            autoFocus
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" className="btn-primary w-full">Let's go!</button>
        </form>
      </div>
    </div>
  )
}

export default function VotePage() {
  const { slug } = useParams<{ slug: string }>()
  const [guestName, setGuestName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('vote')
  const qc = useQueryClient()

  useEffect(() => {
    if (slug) {
      const stored = sessionStorage.getItem(`guest_name_${slug}`)
      if (stored) setGuestName(stored)
    }
  }, [slug])

  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(slug, true)

  const { data: dishes } = useQuery({
    queryKey: ['all-dishes', event?.table_id],
    queryFn: async () => {
      if (!event) throw new Error('')
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('table_id', event.table_id)
        .neq('status', 'archived')
      if (error) throw error
      return data as Dish[]
    },
    enabled: !!event,
  })

  const shortlistDishes = dishes?.filter(d => event?.shortlist_dish_ids.includes(d.id)) ?? []
  const nonShortlistDishes = dishes?.filter(d => !event?.shortlist_dish_ids.includes(d.id)) ?? []

  const { voteCounts } = useRealtimeVotes(event?.id ?? null)
  const totalVotes = voteCounts.reduce((s, v) => s + v.count, 0)

  const { data: myVotes } = useQuery({
    queryKey: ['my-votes', event?.id, guestName],
    queryFn: async () => {
      if (!event || !guestName) return []
      const { data, error } = await supabase
        .from('guest_votes')
        .select('dish_id')
        .eq('event_id', event.id)
        .eq('guest_name', guestName)
      if (error) throw error
      return data.map(v => v.dish_id)
    },
    enabled: !!event && !!guestName,
  })

  const voteMutation = useMutation({
    mutationFn: async (dishId: number) => {
      if (!event || !guestName) throw new Error('Not ready')
      const alreadyVoted = myVotes?.includes(dishId)
      if (alreadyVoted) {
        const { error } = await supabase
          .from('guest_votes')
          .delete()
          .eq('event_id', event.id)
          .eq('guest_name', guestName)
          .eq('dish_id', dishId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('guest_votes').insert({
          event_id: event.id,
          guest_name: guestName,
          dish_id: dishId,
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-votes', event?.id, guestName] })
    },
  })

  if (eventLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )

  if (eventError || !event) return (
    <div className="flex items-center justify-center min-h-screen text-center px-4">
      <div>
        <div className="text-4xl mb-3">🍽️</div>
        <h2 className="font-heading text-xl text-forest mb-2">Event not found</h2>
        <p className="text-stone-500 text-sm">Check the link or ask your host to resend it.</p>
      </div>
    </div>
  )

  const votingClosed = event.status === 'voting_closed' || event.status === 'menu_announced' || event.status === 'archived'

  return (
    <>
      {!guestName && slug && <NameModal slug={slug} onName={setGuestName} />}

      <div className="min-h-screen">
        {/* Event header */}
        <div className="bg-white border-b border-stone-100 px-4 py-4">
          <div className="max-w-xl mx-auto">
            <h1 className="font-heading text-xl font-semibold text-forest">{event.name}</h1>
            {event.dinner_date && (
              <p className="text-stone-400 text-xs">
                🗓 {new Date(event.dinner_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            )}
            {guestName && (
              <p className="text-stone-400 text-xs mt-0.5">Voting as <strong>{guestName}</strong></p>
            )}
            {votingClosed && (
              <span className="text-xs bg-amber/20 text-amber-dark px-2 py-0.5 rounded-full mt-1 inline-block">
                Voting closed
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-stone-100 sticky top-[57px] z-30">
          <div className="max-w-xl mx-auto flex overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'border-forest text-forest' : 'border-transparent text-stone-500'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-6">
          {/* VOTE TAB */}
          {activeTab === 'vote' && (
            <div className="space-y-4">
              {votingClosed && (
                <div className="card p-4 bg-amber/10 border-amber/30 border text-center">
                  <p className="text-amber-dark text-sm font-medium">Voting has closed for this event.</p>
                </div>
              )}
              {shortlistDishes.length === 0 && (
                <div className="card p-8 text-center">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-stone-500 text-sm">No dishes on the shortlist yet.</p>
                </div>
              )}
              {shortlistDishes.map(dish => {
                const vc = voteCounts.find(v => v.dish_id === dish.id)?.count ?? 0
                const voted = myVotes?.includes(dish.id) ?? false
                return (
                  <VoteCard
                    key={dish.id}
                    dish={dish}
                    voted={voted}
                    voteCount={vc}
                    totalVotes={totalVotes}
                    onVote={() => guestName && !votingClosed && voteMutation.mutate(dish.id)}
                    votingDisabled={!guestName || votingClosed || voteMutation.isPending}
                  />
                )
              })}
            </div>
          )}

          {/* BROWSE TAB */}
          {activeTab === 'browse' && guestName && event && (
            <WishlistPanel
              eventId={event.id}
              guestName={guestName}
              allDishes={dishes ?? []}
              shortlistIds={event.shortlist_dish_ids}
            />
          )}

          {/* POTLUCK TAB */}
          {activeTab === 'potluck' && guestName && event && (
            <PotluckBoard
              eventId={event.id}
              guestName={guestName}
              enabled={event.potluck_enabled}
            />
          )}

          {/* FOOD FUND TAB */}
          {activeTab === 'food-fund' && guestName && event && (
            <FoodFund
              eventId={event.id}
              guestName={guestName}
              enabled={event.food_fund_enabled}
              threshold={event.food_fund_threshold}
              nonShortlistDishes={nonShortlistDishes}
            />
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && guestName && event && (
            <PreferencesForm
              eventId={event.id}
              guestName={guestName}
            />
          )}

          {!guestName && activeTab !== 'vote' && (
            <div className="text-center py-10 text-stone-400 text-sm">
              Enter your name to continue.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
