import { Link } from 'react-router-dom'
import type { MiscItem } from '../../types'
import StarRating from '../ui/StarRating'

const SUB_CAT_LABELS: Record<MiscItem['sub_category'], string> = {
  snacks: 'Snacks',
  condiments: 'Condiments',
  instant_noodles: 'Instant Noodles',
  baked_goods: 'Baked Goods',
}

const STATUS_STYLES: Record<MiscItem['status'], string> = {
  tried_loved: 'bg-green-100 text-green-700',
  tried: 'bg-amber/20 text-amber-dark',
  wishlist: 'bg-stone-100 text-stone-500',
}
const STATUS_LABELS: Record<MiscItem['status'], string> = {
  tried_loved: 'Tried & Loved',
  tried: 'Tried',
  wishlist: 'Wishlist',
}

interface Props {
  item: MiscItem
  tableId: number
}

export default function MiscCard({ item, tableId }: Props) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="h-36 bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center rounded-t-2xl overflow-hidden">
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">🛒</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-heading text-base font-semibold text-forest group-hover:text-forest-light transition-colors line-clamp-1">
            {item.name}
          </h3>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {SUB_CAT_LABELS[item.sub_category]}
          </span>
        </div>
        {item.brand && <p className="text-stone-400 text-xs mb-2">{item.brand}</p>}
        <div className="flex items-center gap-2 mb-2">
          {item.rating && <StarRating value={item.rating} onChange={() => undefined} readonly />}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
            {STATUS_LABELS[item.status]}
          </span>
        </div>
        {item.tasting_notes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.tasting_notes.slice(0, 3).map(n => (
              <span key={n} className="text-xs bg-stone-50 text-stone-500 px-2 py-0.5 rounded-full">{n}</span>
            ))}
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-stone-50 flex justify-end">
          <Link to={`/tables/${tableId}/misc/${item.id}/edit`} className="text-xs text-forest hover:underline">Edit</Link>
        </div>
      </div>
    </div>
  )
}
