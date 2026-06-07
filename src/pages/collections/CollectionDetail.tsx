import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Collection, CollectionItem } from '../../types'

type ItemType = 'dish' | 'drink' | 'misc' | 'experience'
const TYPE_EMOJI: Record<ItemType, string> = { dish: '🍽️', drink: '🥂', misc: '🛒', experience: '🗺️' }

interface EnrichedItem extends CollectionItem {
  name: string
  photo_url: string | null
}

export default function CollectionDetail() {
  const { id, collectionId } = useParams<{ id: string; collectionId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data: collection, isLoading } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase.from('collections').select('*').eq('id', Number(collectionId)).single()
      if (error) throw error
      return data as Collection
    },
  })

  const { data: items } = useQuery({
    queryKey: ['collection_items', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase.from('collection_items').select('*')
        .eq('collection_id', Number(collectionId)).order('sort_order')
      if (error) throw error
      const rawItems = data as CollectionItem[]

      const enriched: EnrichedItem[] = await Promise.all(rawItems.map(async item => {
        const table = item.item_type === 'dish' ? 'dishes' :
          item.item_type === 'drink' ? 'drinks' :
          item.item_type === 'misc' ? 'misc_items' : 'experiences'
        const photoField = item.item_type === 'dish' ? 'photos' : 'photo_url'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: d } = await (supabase as any).from(table).select(`name,${photoField}`).eq('id', item.item_id).single()
        const name = d?.name ?? 'Unknown'
        const photo_url = item.item_type === 'dish'
          ? (d?.photos?.[0] ?? null)
          : (d?.photo_url ?? null)
        return { ...item, name, photo_url }
      }))
      return enriched
    },
    enabled: !!collectionId,
  })

  const togglePrivacy = async () => {
    if (!collection) return
    const newPrivacy = collection.privacy === 'private' ? 'shared' : 'private'
    await supabase.from('collections').update({ privacy: newPrivacy }).eq('id', collection.id)
    queryClient.invalidateQueries({ queryKey: ['collection', collectionId] })
  }

  const removeItem = async (itemId: number) => {
    await supabase.from('collection_items').delete().eq('id', itemId)
    queryClient.invalidateQueries({ queryKey: ['collection_items', collectionId] })
  }

  const shareLink = collection ? `${window.location.origin}/collection/${collection.slug}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )

  if (!collection) return (
    <div className="max-w-xl mx-auto px-4 py-10 text-center text-stone-500">Collection not found.</div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button onClick={() => navigate(`/tables/${id}`)} className="text-sm text-stone-500 hover:text-forest">
          ← Back to Table
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-forest">{collection.name}</h1>
          {collection.description && <p className="text-stone-500 mt-1">{collection.description}</p>}
          <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
            collection.privacy === 'shared' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
          }`}>
            {collection.privacy === 'shared' ? '🌐 Shared' : '🔒 Private'}
          </span>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <button onClick={togglePrivacy} className="btn-outline text-sm">
            {collection.privacy === 'private' ? 'Make Public' : 'Make Private'}
          </button>
          {collection.privacy === 'shared' && (
            <button onClick={copyLink} className="btn-secondary text-sm">
              {copied ? '✓ Copied!' : 'Copy Share Link'}
            </button>
          )}
        </div>
      </div>

      {collection.privacy === 'shared' && (
        <div className="card p-4 mb-6 bg-green-50 border-green-100">
          <p className="text-sm text-green-700">
            Public link: <a href={shareLink} target="_blank" rel="noopener noreferrer" className="underline">{shareLink}</a>
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(items ?? []).map(item => (
          <div key={item.id} className="card group">
            <div className="h-32 bg-gradient-to-br from-forest/10 to-amber/10 flex items-center justify-center rounded-t-2xl overflow-hidden">
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{TYPE_EMOJI[item.item_type]}</span>
              )}
            </div>
            <div className="p-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-heading text-sm font-semibold text-forest line-clamp-1">{item.name}</p>
                <p className="text-xs text-stone-400 capitalize">{item.item_type}</p>
              </div>
              <button onClick={() => removeItem(item.id)}
                className="text-xs text-stone-300 hover:text-red-400 transition-colors flex-shrink-0">
                ×
              </button>
            </div>
          </div>
        ))}
        {(items ?? []).length === 0 && (
          <div className="col-span-3 card p-10 text-center">
            <p className="text-stone-400 text-sm">No items in this collection yet.</p>
            <Link to={`/tables/${id}`} className="text-forest hover:underline text-sm mt-2 inline-block">
              Browse your table to add items
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
