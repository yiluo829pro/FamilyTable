import { Link } from 'react-router-dom'
import type { Experience } from '../../types'
import StarRating from '../ui/StarRating'

const SUB_CAT_LABELS: Record<Experience['sub_category'], string> = {
  restaurant: 'Restaurant',
  cafe: 'Café',
  travel: 'Travel',
  cookbook: 'Cookbook',
}

const SUB_CAT_EMOJI: Record<Experience['sub_category'], string> = {
  restaurant: '🍽️',
  cafe: '☕',
  travel: '✈️',
  cookbook: '📖',
}

interface Props {
  experience: Experience
  tableId: number
}

export default function ExperienceCard({ experience, tableId }: Props) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="h-36 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center rounded-t-2xl overflow-hidden">
        {experience.photo_url ? (
          <img src={experience.photo_url} alt={experience.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">{SUB_CAT_EMOJI[experience.sub_category]}</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-heading text-base font-semibold text-forest group-hover:text-forest-light transition-colors line-clamp-1">
            {experience.name}
          </h3>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {SUB_CAT_LABELS[experience.sub_category]}
          </span>
        </div>
        {(experience.city || experience.country) && (
          <p className="text-stone-400 text-xs mb-2">
            {[experience.city, experience.country].filter(Boolean).join(', ')}
          </p>
        )}
        {experience.rating && (
          <div className="mb-2">
            <StarRating value={experience.rating} onChange={() => undefined} readonly />
          </div>
        )}
        {experience.ambiance_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {experience.ambiance_tags.slice(0, 3).map(t => (
              <span key={t} className="text-xs bg-stone-50 text-stone-500 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-stone-50 flex justify-end">
          <Link to={`/tables/${tableId}/experiences/${experience.id}/edit`} className="text-xs text-forest hover:underline">Edit</Link>
        </div>
      </div>
    </div>
  )
}
