import { Link } from 'react-router-dom'
import type { Drink } from '../../types'
import StarRating from '../ui/StarRating'

const SUB_TYPE_LABELS: Record<Drink['sub_type'], string> = {
  coffee: 'Coffee',
  wine: 'Wine',
  beer: 'Beer',
  spirits: 'Spirits',
  sake: 'Sake',
  tea: 'Tea',
  non_alcoholic: 'Non-Alc',
}

const STATUS_STYLES: Record<Drink['status'], string> = {
  tried_loved: 'bg-green-100 text-green-700',
  tried: 'bg-amber/20 text-amber-dark',
  wishlist: 'bg-stone-100 text-stone-500',
}
const STATUS_LABELS: Record<Drink['status'], string> = {
  tried_loved: 'Tried & Loved',
  tried: 'Tried',
  wishlist: 'Wishlist',
}

interface Props {
  drink: Drink
  tableId: number
}

export default function DrinkCard({ drink, tableId }: Props) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center rounded-t-2xl overflow-hidden">
        {drink.photo_url ? (
          <img src={drink.photo_url} alt={drink.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">🥂</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-heading text-base font-semibold text-forest group-hover:text-forest-light transition-colors line-clamp-1">
            {drink.name}
          </h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {SUB_TYPE_LABELS[drink.sub_type]}
          </span>
        </div>
        {drink.brand && <p className="text-stone-400 text-xs mb-2">{drink.brand}</p>}
        <div className="flex items-center gap-2 mb-2">
          {drink.rating && <StarRating value={drink.rating} onChange={() => undefined} readonly />}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[drink.status]}`}>
            {STATUS_LABELS[drink.status]}
          </span>
        </div>
        {drink.tasting_notes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {drink.tasting_notes.slice(0, 3).map(n => (
              <span key={n} className="text-xs bg-stone-50 text-stone-500 px-2 py-0.5 rounded-full">{n}</span>
            ))}
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-stone-50 flex justify-end">
          <Link to={`/tables/${tableId}/drinks/${drink.id}/edit`} className="text-xs text-forest hover:underline">Edit</Link>
        </div>
      </div>
    </div>
  )
}
