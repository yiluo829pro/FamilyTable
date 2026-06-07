import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { VoteCount } from '../types'

export function useRealtimeVotes(eventId: number | null, initialCounts: VoteCount[] = []) {
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>(initialCounts)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const wsActiveRef = useRef(false)

  const fetchVotes = async () => {
    if (!eventId) return
    const { data, error } = await supabase
      .from('guest_votes')
      .select('dish_id')
      .eq('event_id', eventId)
    if (error || !data) return
    const counts: Record<number, number> = {}
    data.forEach(v => { counts[v.dish_id] = (counts[v.dish_id] ?? 0) + 1 })
    setVoteCounts(Object.entries(counts).map(([dish_id, count]) => ({ dish_id: Number(dish_id), count })))
  }

  useEffect(() => {
    if (!eventId) return

    fetchVotes()

    // Realtime subscription
    const channel = supabase
      .channel(`votes:event:${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guest_votes', filter: `event_id=eq.${eventId}` },
        () => { fetchVotes() }
      )
      .subscribe((status) => {
        wsActiveRef.current = status === 'SUBSCRIBED'
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          wsActiveRef.current = false
        }
      })
    channelRef.current = channel

    // Fallback polling every 20s
    pollingRef.current = setInterval(() => {
      if (!wsActiveRef.current) fetchVotes()
    }, 20000)

    return () => {
      channel.unsubscribe()
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [eventId])

  useEffect(() => {
    setVoteCounts(initialCounts)
  }, [JSON.stringify(initialCounts)])

  return { voteCounts, refetch: fetchVotes }
}
