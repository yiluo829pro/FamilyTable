import { useState } from 'react'

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher', 'Keto', 'Paleo']
const CUISINE_OPTIONS = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'Thai', 'American', 'French', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Other']
const STATUS_OPTIONS: Array<{ value: 'active' | 'memory_only' | 'archived'; label: string }> = [
  { value: 'active', label: 'Active — can be added to shortlists' },
  { value: 'memory_only', label: 'Memory only — preserved but not for events' },
  { value: 'archived', label: 'Archived — hidden from most views' },
]

export interface DishFormData {
  name: string
  cuisine_tag: string
  dietary_tags: string[]
  cook_time: string
  story: string
  recipe_ingredients: string
  recipe_steps: string
  status: 'active' | 'memory_only' | 'archived'
}

interface Props {
  initialData?: Partial<DishFormData>
  onSubmit: (data: DishFormData) => Promise<void>
  submitLabel?: string
}

export default function DishForm({ initialData, onSubmit, submitLabel = 'Save Dish' }: Props) {
  const [form, setForm] = useState<DishFormData>({
    name: initialData?.name ?? '',
    cuisine_tag: initialData?.cuisine_tag ?? '',
    dietary_tags: initialData?.dietary_tags ?? [],
    cook_time: initialData?.cook_time ?? '',
    story: initialData?.story ?? '',
    recipe_ingredients: initialData?.recipe_ingredients ?? '',
    recipe_steps: initialData?.recipe_steps ?? '',
    status: initialData?.status ?? 'active',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleDietary = (tag: string) => {
    setForm(f => ({
      ...f,
      dietary_tags: f.dietary_tags.includes(tag)
        ? f.dietary_tags.filter(t => t !== tag)
        : [...f.dietary_tags, tag],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="label">Dish name *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="input-field"
          placeholder="e.g. Grandma's Apple Pie"
          maxLength={100}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Cuisine</label>
          <select
            value={form.cuisine_tag}
            onChange={e => setForm(f => ({ ...f, cuisine_tag: e.target.value }))}
            className="input-field"
          >
            <option value="">Select cuisine…</option>
            {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Cook time</label>
          <input
            type="text"
            value={form.cook_time}
            onChange={e => setForm(f => ({ ...f, cook_time: e.target.value }))}
            className="input-field"
            placeholder="e.g. 45 minutes"
          />
        </div>
      </div>

      <div>
        <label className="label">Dietary tags</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {DIETARY_OPTIONS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleDietary(tag)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                form.dietary_tags.includes(tag)
                  ? 'bg-forest text-white border-forest'
                  : 'border-stone-200 text-stone-600 hover:border-forest'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Story</label>
        <textarea
          value={form.story}
          onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
          className="input-field min-h-[90px] resize-y"
          placeholder="The story behind this dish — memories, who cooked it first, special occasions…"
        />
      </div>

      <div>
        <label className="label">Ingredients</label>
        <textarea
          value={form.recipe_ingredients}
          onChange={e => setForm(f => ({ ...f, recipe_ingredients: e.target.value }))}
          className="input-field min-h-[100px] resize-y font-mono text-sm"
          placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs…"
        />
      </div>

      <div>
        <label className="label">Steps</label>
        <textarea
          value={form.recipe_steps}
          onChange={e => setForm(f => ({ ...f, recipe_steps: e.target.value }))}
          className="input-field min-h-[120px] resize-y"
          placeholder="1. Preheat oven to 180°C&#10;2. Mix dry ingredients…"
        />
      </div>

      <div>
        <label className="label">Status</label>
        <select
          value={form.status}
          onChange={e => setForm(f => ({ ...f, status: e.target.value as DishFormData['status'] }))}
          className="input-field"
        >
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
