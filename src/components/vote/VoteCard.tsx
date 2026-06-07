import type { Dish, VoteCount } from '../../types'

interface Props {
  dish: Dish
  voted: boolean
  voteCount: number
  totalVotes: number
  onVote: () => void
  votingDisabled?: boolean
}

export default function VoteCard({ dish, voted, voteCount, totalVotes, onVote, votingDisabled }: Props) {
  const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0

  return (
    <div className={`card overflow-hidden transition-all ${voted ? 'ring-2 ring-forest' : ''}`}>
      <div className="h-48 bg-gradient-to-br from-amber/10 to-forest/10 flex items-center justify-center overflow-hidden">
        {dish.photos && dish.photos.length > 0 ? (
          <img src={dish.photos[0]} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">🍲</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-forest">{dish.name}</h3>
        {dish.cuisine_tag && <p className="text-stone-400 text-xs mb-1">{dish.cuisine_tag}</p>}
        {dish.story && (
          <p className="text-stone-500 text-sm line-clamp-2 mb-2">{dish.story}</p>
        )}
        {dish.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dish.dietary_tags.map(t => (
              <span key={t} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
        {dish.cook_time && <p className="text-stone-400 text-xs mb-3">⏱ {dish.cook_time}</p>}

        {/* Vote bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span>{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-forest transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <button
          onClick={onVote}
          disabled={votingDisabled}
          className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
            voted
              ? 'bg-forest text-white'
              : 'border-2 border-forest text-forest hover:bg-forest hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {voted ? '❤️ Voted!' : '🤍 Vote for this'}
        </button>
      </div>
    </div>
  )
}
