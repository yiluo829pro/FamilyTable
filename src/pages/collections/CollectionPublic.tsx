import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Collection, CollectionItem } from '../../types'
import StarRating from '../../components/ui/StarRating'

type ItemType = 'dish' | 'drink' | 'misc' | 'experience'
const TYPE_EMOJI: Record<ItemType, string> = { dish: '🍽️', drink: '🥂', misc: '🛒', experience: '🗺️' }

interface EnrichedItem extends CollectionItem {
  name: string
  photo_url: string | null
  rating: number | null
  notes: string | null
}

export default function CollectionPublic() {
  const { slug } = useParams<{ slug: string }>()

  const { data: collection, isLoading: colLoading } = useQuery({
    queryKey: ['collection_public', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('collections').select('*').eq('slug', slug!).eq('privacy', 'shared').single()
      if (error) throw error
      return data as Collection
    },
  })

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['collection_items_public', collection?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('collection_items').select('*')
        .eq('collection_id', collection!.id).order('sort_order')
      if (error) throw error
      const rawItems = data as CollectionItem[]

      const enriched: EnrichedItem[] = await Promise.all(rawItems.map(async item => {
        const table = item.item_type === 'dish' ? 'dishes' :
          item.item_type === 'drink' ? 'drinks' :
          item.item_type === 'misc' ? 'misc_items' : 'experiences'
        const photoField = item.item_type === 'dish' ? 'photos' : 'photo_url'
        const ratingField = item.item_type === 'dish' ? null : 'rating'
        const notesField = item.item_type === 'dish' ? 'story' :
          item.item_type === 'experience' ? 'personal_notes' : 'personal_notes'
        const selectFields = ['name', photoField, ratingField, notesField].filter(Boolean).join(',')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: d } = await (supabase as any).from(table).select(selectFields).eq('id', item.item_id).single()
        return {
          ...item,
          name: d?.name ?? 'Unknown',
          photo_url: item.item_type === 'dish' ? (d?.photos?.[0] ?? null) : (d?.photo_url ?? null),
          rating: d?.rating ?? null,
          notes: d?.[notesField] ?? null,
        }
      }))
      return enriched
    },
    enabled: !!collection,
  })

  if (colLoading || itemsLoading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )

  if (!collection) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <p className="text-stone-500 text-lg">Collection not found or not publicly shared.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-stone-100 py-5">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <span className="font-heading text-xl font-semibold text-forest">Family Table</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-heading text-3xl font-bold text-forest mb-2">{collection.name}</h1>
        {collection.description && <p className="text-stone-500 mb-8">{collection.description}</p>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(items ?? []).map(item => (
            <div key={item.id} className="card">
              <div className="h-40 bg-gradient-to-br from-forest/10 to-amber/10 flex items-center justify-center rounded-t-2xl overflow-hidden">
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{TYPE_EMOJI[item.item_type]}</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-heading text-base font-semibold text-forest">{item.name}</h3>
                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                    {item.item_type}
                  </span>
                </div>
                {item.rating && <StarRating value={item.rating} onChange={() => undefined} readonly />}
                {item.notes && <p className="text-stone-500 text-sm mt-2 line-clamp-3">{item.notes}</p>}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-stone-400 text-sm mt-12">
          Shared via <span className="font-semibold text-forest">Family Table</span>
        </p>
      </div>
    </div>
  )
}
