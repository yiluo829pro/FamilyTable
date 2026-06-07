import { Link } from 'react-router-dom'
import type { Collection } from '../../types'

interface Props {
  collection: Collection
  tableId: number
}

export default function CollectionCard({ collection, tableId }: Props) {
  return (
    <Link to={`/tables/${tableId}/collections/${collection.id}`} className="card p-4 hover:shadow-md transition-shadow group block">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-base font-semibold text-forest group-hover:text-forest-light transition-colors line-clamp-1">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-stone-500 text-sm mt-1 line-clamp-2">{collection.description}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
          collection.privacy === 'shared' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
        }`}>
          {collection.privacy === 'shared' ? 'Shared' : 'Private'}
        </span>
      </div>
      <p className="text-stone-400 text-xs mt-3">
        Created {new Date(collection.created_at).toLocaleDateString()}
      </p>
    </Link>
  )
}
