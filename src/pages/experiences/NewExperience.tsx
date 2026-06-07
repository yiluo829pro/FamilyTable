import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import ExperienceForm, { type ExperienceFormData } from '../../components/experiences/ExperienceForm'

export default function NewExperience() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()

  const handleSubmit = async (data: ExperienceFormData) => {
    if (!user || !id) throw new Error('Not authenticated')
    const { data: exp, error } = await supabase.from('experiences').insert({
      table_id: Number(id),
      added_by: user.id,
      name: data.name,
      sub_category: data.sub_category,
      photo_url: data.photo_url || null,
      rating: data.rating,
      status: data.status,
      personal_notes: data.personal_notes || null,
      cuisine: data.cuisine || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      price_range: data.price_range || null,
      occasion: data.occasion || null,
      ambiance_tags: data.ambiance_tags,
      dishes_tried: data.dishes_tried || null,
      standout_dish: data.standout_dish || null,
      would_return: data.would_return || null,
      cafe_specialty: data.cafe_specialty || null,
      work_friendly: data.work_friendly,
      wifi_available: data.wifi_available,
      trip_name: data.trip_name || null,
      trip_city: data.trip_city || null,
      trip_country: data.trip_country || null,
      trip_start_date: data.trip_start_date || null,
      trip_end_date: data.trip_end_date || null,
      author: data.author || null,
      cuisine_focus: data.cuisine_focus || null,
      year_published: data.year_published ? Number(data.year_published) : null,
      publisher: data.publisher || null,
      favorite_recipes: data.favorite_recipes || null,
      visit_dates: [],
    }).select().single()
    if (error) throw error

    if (exp && data.travel_moments.length > 0) {
      const moments = data.travel_moments.filter(m => m.item_name.trim()).map(m => ({
        experience_id: exp.id,
        item_name: m.item_name,
        where_eaten: m.where_eaten || null,
        memory_note: m.memory_note || null,
        photo_url: m.photo_url || null,
      }))
      if (moments.length > 0) {
        const { error: momErr } = await supabase.from('travel_moments').insert(moments)
        if (momErr) throw momErr
      }
    }

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
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">Add an Experience</h1>
        <p className="text-stone-500 text-sm mb-6">Log a restaurant, café, trip, or cookbook.</p>
        <ExperienceForm onSubmit={handleSubmit} submitLabel="Add Experience" />
      </div>
    </div>
  )
}
