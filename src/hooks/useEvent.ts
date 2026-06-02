import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Event, Dish } from '../types'

export function useEvent(idOrSlug: string | undefined, bySlug = false) {
  return useQuery({
    queryKey: ['event', idOrSlug, bySlug],
    queryFn: async () => {
      if (!idOrSlug) throw new Error('No event identifier')
      const query = supabase.from('events').select('*')
      const { data, error } = bySlug
        ? await query.eq('slug', idOrSlug).single()
        : await query.eq('id', Number(idOrSlug)).single()
      if (error) throw error
      return data as Event
    },
    enabled: !!idOrSlug,
  })
}

export function useEventDishes(event: Event | undefined) {
  return useQuery({
    queryKey: ['event-dishes', event?.id],
    queryFn: async () => {
      if (!event) throw new Error('No event')
      const allIds = Array.from(new Set([
        ...event.shortlist_dish_ids,
        ...event.final_menu_dish_ids,
      ]))
      if (allIds.length === 0) return []
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .in('id', allIds)
      if (error) throw error
      return data as Dish[]
    },
    enabled: !!event,
  })
}
