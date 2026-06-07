import { Link } from 'react-router-dom'
import type { Event } from '../../types'

const STATUS_COLORS: Record<Event['status'], string> = {
  draft: 'bg-stone-100 text-stone-500',
  live: 'bg-green-100 text-green-700',
  voting_closed: 'bg-amber-100 text-amber-700',
  menu_announced: 'bg-blue-100 text-blue-700',
  archived: 'bg-stone-100 text-stone-400',
}
const STATUS_LABELS: Record<Event['status'], string> = {
  draft: 'Draft',
  live: 'Live',
  voting_closed: 'Voting Closed',
  menu_announced: 'Menu Announced',
  archived: 'Archived',
}

export default function EventCard({ event }: { event: Event }) {
  return (
    <Link to={`/events/${event.id}`} className="card p-5 hover:shadow-md transition-shadow block">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-semibold text-forest">{event.name}</h3>
          {event.dinner_date && (
            <p className="text-stone-400 text-xs mt-0.5">
              🗓 {new Date(event.dinner_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          <p className="text-stone-400 text-xs mt-0.5">
            /vote/{event.slug}
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[event.status]}`}>
          {STATUS_LABELS[event.status]}
        </span>
      </div>
    </Link>
  )
}
