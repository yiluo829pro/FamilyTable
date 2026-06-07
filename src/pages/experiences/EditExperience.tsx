import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import ExperienceForm, { type ExperienceFormData } from '../../components/experiences/ExperienceForm'
import type { Experience, TravelMoment } from '../../types'

export default function EditExperience() {
  const navigate = useNavigate()
  const { id, expId } = useParams<{ id: string; expId: string }>()

  const { data: experience, isLoading: expLoading } = useQuery({
    queryKey: ['experience', expId],
    queryFn: async () => {
      const { data, error } = await supabase.from('experiences').select('*').eq('id', Number(expId)).single()
      if (error) throw error
      return data as Experience
    },
  })

  const { data: moments } = useQuery({
    queryKey: ['travel_moments', expId],
    queryFn: async () => {
      const { data, error } = await supabase.from('travel_moments').select('*').eq('experience_id', Number(expId)).order('created_at')
      if (error) throw error
      return data as TravelMoment[]
    },
    enabled: !!expId,
  })

  const handleSubmit = async (data: ExperienceFormData) => {
    const { error } = await supabase.from('experiences').update({
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
      updated_at: new Date().toISOString(),
    }).eq('id', Number(expId))
    if (error) throw error

    // Replace travel moments
    if (data.sub_category === 'travel') {
      await supabase.from('travel_moments').delete().eq('experience_id', Number(expId))
      const newMoments = data.travel_moments.filter(m => m.item_name.trim()).map(m => ({
        experience_id: Number(expId),
        item_name: m.item_name,
        where_eaten: m.where_eaten || null,
        memory_note: m.memory_note || null,
        photo_url: m.photo_url || null,
      }))
      if (newMoments.length > 0) {
        await supabase.from('travel_moments').insert(newMoments)
      }
    }

    navigate(`/tables/${id}`)
  }

  if (expLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )

  if (!experience) return (
    <div className="max-w-xl mx-auto px-4 py-10 text-center text-stone-500">Experience not found.</div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <button onClick={() => navigate(`/tables/${id}`)} className="text-sm text-stone-500 hover:text-forest">
          ← Back to Table
        </button>
      </div>
      <div className="card p-8">
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">Edit Experience</h1>
        <p className="text-stone-500 text-sm mb-6">{experience.name}</p>
        <ExperienceForm initialData={experience} initialMoments={moments} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
