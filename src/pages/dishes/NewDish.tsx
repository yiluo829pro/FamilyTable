import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import DishForm, { type DishFormData } from '../../components/dishes/DishForm'

export default function NewDish() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()

  const handleSubmit = async (data: DishFormData) => {
    if (!user || !id) throw new Error('Not authenticated')
    const { error } = await supabase.from('dishes').insert({
      table_id: Number(id),
      name: data.name,
      cuisine_tag: data.cuisine_tag || null,
      dietary_tags: data.dietary_tags,
      cook_time: data.cook_time || null,
      story: data.story || null,
      recipe_ingredients: data.recipe_ingredients || null,
      recipe_steps: data.recipe_steps || null,
      status: data.status,
      created_by: user.id,
      photos: [],
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
        <h1 className="font-heading text-2xl font-bold text-forest mb-1">Add a Dish</h1>
        <p className="text-stone-500 text-sm mb-6">Save a recipe, a memory, or a dish idea to your table's library.</p>
        <DishForm onSubmit={handleSubmit} submitLabel="Add Dish" />
      </div>
    </div>
  )
}
