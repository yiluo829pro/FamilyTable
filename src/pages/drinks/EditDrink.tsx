import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import DrinkForm, { type DrinkFormData } from '../../components/drinks/DrinkForm'
import type { Drink } from '../../types'

export default function EditDrink() {
  const navigate = useNavigate()
  const { id, drinkId } = useParams<{ id: string; drinkId: string }>()

  const { data: drink, isLoading } = useQuery({
    queryKey: ['drink', drinkId],
    queryFn: async () => {
      const { data, error } = await supabase.from('drinks').select('*').eq('id', Number(drinkId)).single()
      if (error) throw error
      return data as Drink
    },
  })

  const handleSubmit = async (data: DrinkFormData) => {
    const { error } = await supabase.from('drinks').update({
      name: data.name,
      brand: data.brand || null,
      sub_type: data.sub_type,
      photo_url: data.photo_url || null,
      tasting_notes: data.tasting_notes,
      rating: data.rating,
      status: data.status,
      personal_notes: data.personal_notes || null,
      roast_level: data.roast_level || null,
      process: data.process || null,
      origin_country: data.origin_country || null,
      brew_method: data.brew_method || null,
      blend_name: data.blend_name || null,
      wine_type: data.wine_type || null,
      varietal: data.varietal || null,
      producer: data.producer || null,
      vintage_year: data.vintage_year ? Number(data.vintage_year) : null,
      wine_region: data.wine_region || null,
      abv: data.abv ? Number(data.abv) : null,
      price_range: data.price_range || null,
      occasion: data.occasion || null,
      brewery: data.brewery || null,
      beer_style: data.beer_style || null,
      beer_abv: data.beer_abv ? Number(data.beer_abv) : null,
      ibu: data.ibu ? Number(data.ibu) : null,
      beer_format: data.beer_format || null,
      spirit_type: data.spirit_type || null,
      distillery: data.distillery || null,
      age_statement: data.age_statement ? Number(data.age_statement) : null,
      spirit_abv: data.spirit_abv ? Number(data.spirit_abv) : null,
      cocktail_notes: data.cocktail_notes || null,
      sake_type: data.sake_type || null,
      sake_brewery: data.sake_brewery || null,
      sake_region: data.sake_region || null,
      smv: data.smv ? Number(data.smv) : null,
      serving_temp: data.serving_temp || null,
      tea_type: data.tea_type || null,
      tea_brand: data.tea_brand || null,
      tea_origin: data.tea_origin || null,
      brew_temp: data.brew_temp || null,
      steep_time: data.steep_time || null,
      na_sub_type: data.na_sub_type || null,
      na_brand: data.na_brand || null,
      flavor_variant: data.flavor_variant || null,
      updated_at: new Date().toISOString(),
    }).eq('id', Number(drinkId))
    if (error) throw error
    navigate(`/tables/${id}`)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )

  if (!drink) return (
    <div className="max-w-xl mx-auto px-4 py-10 text-center text-stone-500">Drink not found.</div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <button onClick={() => navigate(`/tables/${id}`)} className="text-sm text-stone-500 hover:text-forest">
          ← Back to Table
        </button>
      </div>
      <div className="card p-8">
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">Edit Drink</h1>
        <p className="text-stone-500 text-sm mb-6">{drink.name}</p>
        <DrinkForm initialData={drink} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
