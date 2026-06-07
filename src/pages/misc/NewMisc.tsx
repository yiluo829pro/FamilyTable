import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import MiscForm, { type MiscFormData } from '../../components/misc/MiscForm'

export default function NewMisc() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()

  const handleSubmit = async (data: MiscFormData) => {
    if (!user || !id) throw new Error('Not authenticated')
    const { error } = await supabase.from('misc_items').insert({
      table_id: Number(id),
      added_by: user.id,
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
    })
    if (error) throw error
    navigate(`/tables/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <button onClick={() => navigate(`/tables/${id}`)} className="text-sm text-stone-500 hover:text-forest">
          ← Back to Table
        </button>
      </div>
      <div className="card p-8">
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">Add a Misc Item</h1>
        <p className="text-stone-500 text-sm mb-6">Log a snack, condiment, instant noodle, or baked good.</p>
        <MiscForm onSubmit={handleSubmit} submitLabel="Add Item" />
      </div>
    </div>
  )
}
