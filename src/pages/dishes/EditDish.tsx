import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import DishForm, { type DishFormData } from '../../components/dishes/DishForm'
import type { Dish } from '../../types'

export default function EditDish() {
  const navigate = useNavigate()
  const { id, dishId } = useParams<{ id: string; dishId: string }>()
  const queryClient = useQueryClient()

  const { data: dish, isLoading } = useQuery({
    queryKey: ['dish', dishId],
    queryFn: async () => {
      const { data, error } = await supabase.from('dishes').select('*').eq('id', Number(dishId)).single()
      if (error) throw error
      return data as Dish
    },
  })

  const handleSubmit = async (data: DishFormData) => {
    const { error } = await supabase.from('dishes').update({
      name: data.name,
      cuisine_tag: data.cuisine_tag || null,
      dietary_tags: data.dietary_tags,
      cook_time: data.cook_time || null,
      story: data.story || null,
      recipe_ingredients: data.recipe_ingredients || null,
      recipe_steps: data.recipe_steps || null,
      status: data.status,
      updated_at: new Date().toISOString(),
    }).eq('id', Number(dishId))
    if (error) throw error
    queryClient.invalidateQueries({ queryKey: ['dishes', id] })
    navigate(`/tables/${id}`)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
    </div>
  )

  if (!dish) return (
    <div className="max-w-xl mx-auto px-4 py-10 text-center">
      <p className="text-stone-500">Dish not found.</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <button onClick={() => navigate(`/tables/${id}`)} className="text-sm text-stone-500 hover:text-forest">
          ← Back to Table
        </button>
      </div>
      <div className="card p-8">
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">Edit Dish</h1>
        <p className="text-stone-500 text-sm mb-6">Update the details for <strong>{dish.name}</strong></p>
        <DishForm
          initialData={{
            name: dish.name,
            cuisine_tag: dish.cuisine_tag ?? '',
            dietary_tags: dish.dietary_tags,
            cook_time: dish.cook_time ?? '',
            story: dish.story ?? '',
            recipe_ingredients: dish.recipe_ingredients ?? '',
            recipe_steps: dish.recipe_steps ?? '',
            status: dish.status,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}
