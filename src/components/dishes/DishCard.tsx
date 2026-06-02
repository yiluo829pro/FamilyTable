import type { Dish } from '../../types'

interface Props {
  dish: Dish
  selected?: boolean
  onSelect?: () => void
  showSelect?: boolean
}

export default function DishCard({ dish, selected, onSelect, showSelect = false }: Props) {
  return (
    <div
      className={`card transition-all ${showSelect ? 'cursor-pointer hover:shadow-md' : ''} ${selected ? 'ring-2 ring-forest' : ''}`}
      onClick={showSelect ? onSelect : undefined}
    >
      <div className="h-32 bg-gradient-to-br from-amber/10 to-forest/10 flex items-center justify-center rounded-t-2xl overflow-hidden relative">
        {dish.photos && dish.photos.length > 0 ? (
          <img src={dish.photos[0]} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">🍲</span>
        )}
        {showSelect && (
          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? 'bg-forest border-forest' : 'bg-white/80 border-stone-300'
          }`}>
            {selected && <span className="text-white text-xs">✓</span>}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-heading text-sm font-semibold text-forest leading-tight">{dish.name}</h3>
        {dish.cuisine_tag && <p className="text-stone-400 text-xs mt-0.5">{dish.cuisine_tag}</p>}
        {dish.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {dish.dietary_tags.slice(0, 2).map(t => (
              <span key={t} className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
        {dish.cook_time && <p className="text-stone-400 text-xs mt-1">⏱ {dish.cook_time}</p>}
      </div>
    </div>
  )
}
