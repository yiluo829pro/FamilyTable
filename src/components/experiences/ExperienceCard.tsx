import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { Experience, FamilyTable } from '../../types'
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
  editPath: string
}

function AddToWishlistModal({ experience, onClose }: { experience: Experience; onClose: () => void }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const { data: tables } = useQuery({
    queryKey: ['tables', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('tables').select('id,name').order('created_at', { ascending: false })
      return (data ?? []) as Pick<FamilyTable, 'id' | 'name'>[]
    },
    enabled: !!user,
  })

  const handleAdd = async () => {
    if (!selectedTable || !user) return
    setSaving(true)
    const { error } = await supabase.from('dishes').insert({
      table_id: selectedTable,
      name: experience.standout_dish || experience.name,
      cuisine_tag: experience.cuisine || null,
      dietary_tags: [],
      story: experience.personal_notes
        ? `Inspired by ${experience.name}. ${experience.personal_notes}`
        : `Inspired by ${experience.name}`,
      status: 'active',
      created_by: user.id,
      photos: experience.photo_url ? [experience.photo_url] : [],
    })
    setSaving(false)
    if (!error) {
      onClose()
      navigate(`/tables/${selectedTable}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-heading text-lg font-semibold text-forest mb-1">Add to cooking wishlist</h3>
        <p className="text-stone-500 text-sm mb-4">
          This will add <strong>{experience.standout_dish || experience.name}</strong> as a dish in the selected table.
        </p>
        <div className="space-y-2 mb-4">
          {(tables ?? []).map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTable(t.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors text-sm ${
                selectedTable === t.id ? 'border-forest bg-forest/5 text-forest font-medium' : 'border-stone-200 text-stone-600 hover:border-forest'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleAdd} disabled={!selectedTable || saving} className="btn-primary flex-1 disabled:opacity-40">
            {saving ? 'Adding…' : 'Add to Table'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ExperienceCard({ experience, editPath }: Props) {
  const [wishlistOpen, setWishlistOpen] = useState(false)

  return (
    <>
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
          <div className="mt-2 pt-2 border-t border-stone-50 flex items-center justify-between">
            <button
              onClick={() => setWishlistOpen(true)}
              className="text-xs text-amber-600 hover:text-amber-700 hover:underline"
            >
              + Add to cooking wishlist
            </button>
            <Link to={editPath} className="text-xs text-forest hover:underline">Edit</Link>
          </div>
        </div>
      </div>

      {wishlistOpen && (
        <AddToWishlistModal experience={experience} onClose={() => setWishlistOpen(false)} />
      )}
    </>
  )
}
