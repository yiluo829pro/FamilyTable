import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import MiscForm, { type MiscFormData } from '../../components/misc/MiscForm'
import type { MiscItem } from '../../types'

export default function EditMisc() {
  const navigate = useNavigate()
  const { id, miscId } = useParams<{ id: string; miscId: string }>()

  const { data: item, isLoading } = useQuery({
    queryKey: ['misc_item', miscId],
    queryFn: async () => {
      const { data, error } = await supabase.from('misc_items').select('*').eq('id', Number(miscId)).single()
      if (error) throw error
      return data as MiscItem
    },
  })

  const handleSubmit = async (data: MiscFormData) => {
    const { error } = await supabase.from('misc_items').update({
      name: data.name,
      brand: data.brand || null,
      sub_category: data.sub_category,
      photo_url: data.photo_url || null,
      flavor_variant: data.flavor_variant || null,
      rating: data.rating,
      status: data.status,
      personal_notes: data.personal_notes || null,
      where_to_buy: data.where_to_buy || null,
      snack_type: data.snack_type || null,
      heat_level: data.heat_level || null,
      tasting_notes: data.tasting_notes,
      condiment_type: data.condiment_type || null,
      intensity: data.intensity || null,
      noodle_type: data.noodle_type || null,
      broth_type: data.broth_type || null,
      spice_level: data.spice_level ? Number(data.spice_level) : null,
      customization_notes: data.customization_notes || null,
      baked_source: data.baked_source || null,
      baked_type: data.baked_type || null,
      bakery_brand: data.bakery_brand || null,
      updated_at: new Date().toISOString(),
    }).eq('id', Number(miscId))
    if (error) throw error
    navigate(`/tables/${id}`)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )

  if (!item) return (
    <div className="max-w-xl mx-auto px-4 py-10 text-center text-stone-500">Item not found.</div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <button onClick={() => navigate(`/tables/${id}`)} className="text-sm text-stone-500 hover:text-forest">
          ← Back to Table
        </button>
      </div>
      <div className="card p-8">
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">Edit Item</h1>
        <p className="text-stone-500 text-sm mb-6">{item.name}</p>
        <MiscForm initialData={item} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
