import { useParams, Link } from 'react-router-dom'
import { useEvent, useEventDishes } from '../../hooks/useEvent'

export default function EventBroadcast() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading } = useEvent(id)
  const { data: dishes } = useEventDishes(event)

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )

  if (!event) return (
    <div className="text-center py-10 text-stone-500">Event not found.</div>
  )

  const finalDishes = dishes?.filter(d => event.final_menu_dish_ids.includes(d.id)) ?? []

  return (
    <div className="min-h-screen bg-forest text-white">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-amber/80 font-heading text-lg mb-2 uppercase tracking-widest">The Menu is Set</p>
        <h1 className="font-heading text-4xl font-bold mb-2">{event.name}</h1>
        {event.dinner_date && (
          <p className="text-white/60 mb-10">
            {new Date(event.dinner_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        {finalDishes.length === 0 ? (
          <div className="text-white/60 py-10">
            <p>No final menu yet.</p>
            <Link to={`/events/${id}`} className="text-amber mt-2 inline-block hover:underline text-sm">← Go back to pick dishes</Link>
          </div>
        ) : (
          <div className="space-y-4 mb-10">
            {finalDishes.map((dish, i) => (
              <div key={dish.id} className="bg-white/10 rounded-2xl p-5 flex items-center gap-4 text-left">
                <span className="font-heading text-2xl text-amber/60">{i + 1}</span>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold">{dish.name}</h3>
                  {dish.cuisine_tag && <p className="text-white/50 text-xs">{dish.cuisine_tag}</p>}
                  {dish.dietary_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {dish.dietary_tags.map(t => (
                        <span key={t} className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                {dish.photos?.[0] && (
                  <img src={dish.photos[0]} alt={dish.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <p className="text-white/50 text-sm mb-4">Share this page with your guests</p>
          <div className="bg-white/10 rounded-xl px-4 py-2 text-sm text-white/70 font-mono break-all">
            {window.location.origin}/events/{id}/broadcast
          </div>
          <Link to={`/events/${id}`} className="text-amber/70 text-sm mt-4 inline-block hover:text-amber">
            ← Back to Event Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
