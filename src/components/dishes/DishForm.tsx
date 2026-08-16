import { useState, useRef } from 'react'
import PhotoCropPicker from '../ui/PhotoCropPicker'

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
  photoFiles: File[]
  coverIndex: number
  existingPhotos: string[]
  existingCoverIndex: number
}

interface Props {
  initialData?: Partial<DishFormData> & { existingPhotos?: string[] }
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
    photoFiles: [],
    coverIndex: 0,
    existingPhotos: initialData?.existingPhotos ?? [],
    existingCoverIndex: 0,
  })
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [cropTargetIndex, setCropTargetIndex] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleDietary = (tag: string) => {
    setForm(f => ({
      ...f,
      dietary_tags: f.dietary_tags.includes(tag)
        ? f.dietary_tags.filter(t => t !== tag)
        : [...f.dietary_tags, tag],
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    previews.forEach(url => URL.revokeObjectURL(url))
    // Merge with existing files if input was triggered by the + button
    const merged = [...form.photoFiles, ...files]
    const newPreviews = merged.map(f => URL.createObjectURL(f))
    setPreviews(newPreviews)
    setForm(f => ({ ...f, photoFiles: merged, coverIndex: 0 }))
    // Open cropper for the first new file (cover)
    setCropTargetIndex(0)
    setCropFile(merged[0])
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleCropConfirm = (croppedFile: File) => {
    const newFiles = [...form.photoFiles]
    newFiles[cropTargetIndex] = croppedFile
    URL.revokeObjectURL(previews[cropTargetIndex])
    const newPreviews = [...previews]
    newPreviews[cropTargetIndex] = URL.createObjectURL(croppedFile)
    setPreviews(newPreviews)
    setForm(f => ({ ...f, photoFiles: newFiles }))
    setCropFile(null)
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index])
    const newFiles = form.photoFiles.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    const newCover = form.coverIndex >= newFiles.length
      ? Math.max(0, newFiles.length - 1)
      : form.coverIndex === index
        ? 0
        : form.coverIndex > index
          ? form.coverIndex - 1
          : form.coverIndex
    setPreviews(newPreviews)
    setForm(f => ({ ...f, photoFiles: newFiles, coverIndex: newCover }))
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

      {/* Photo upload */}
      <div>
        <label className="label">Photos</label>

        {/* Show existing saved photos when editing */}
        {form.existingPhotos.length > 0 && (
          <div className="mb-3 space-y-2">
            <p className="text-xs text-stone-500">Saved photos — tap to set as cover, or add new photos below.</p>
            <div className="grid grid-cols-3 gap-2">
              {form.existingPhotos.map((src, i) => (
                <div
                  key={src}
                  className="relative group cursor-pointer"
                  onClick={() => setForm(f => ({ ...f, existingCoverIndex: i, photoFiles: [], coverIndex: 0 }))}
                >
                  <img
                    src={src}
                    alt={`Saved photo ${i + 1}`}
                    className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${
                      form.existingCoverIndex === i && previews.length === 0
                        ? 'border-forest ring-2 ring-forest/30'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  />
                  {form.existingCoverIndex === i && previews.length === 0 && (
                    <span className="absolute top-1 left-1 bg-forest text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      const newPhotos = form.existingPhotos.filter((_, j) => j !== i)
                      const newCover = form.existingCoverIndex >= newPhotos.length
                        ? Math.max(0, newPhotos.length - 1)
                        : form.existingCoverIndex > i
                          ? form.existingCoverIndex - 1
                          : form.existingCoverIndex
                      setForm(f => ({ ...f, existingPhotos: newPhotos, existingCoverIndex: newCover }))
                    }}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:border-forest transition-colors"
        >
          <div className="text-3xl mb-2">📷</div>
          <p className="text-stone-500 text-sm">Click to add photos</p>
          <p className="text-stone-400 text-xs mt-1">You can select multiple</p>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {previews.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-stone-500">Tap a photo to set it as the cover. The cover appears on the dish card.</p>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative group cursor-pointer"
                  onClick={() => setForm(f => ({ ...f, coverIndex: i }))}
                >
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${
                      form.coverIndex === i
                        ? 'border-forest ring-2 ring-forest/30'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  />
                  {form.coverIndex === i && (
                    <span className="absolute top-1 left-1 bg-forest text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                      Cover
                    </span>
                  )}
                  {/* Adjust crop button */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setCropTargetIndex(i); setCropFile(form.photoFiles[i]) }}
                    className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                  >
                    ✂ crop
                  </button>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removePhoto(i) }}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-24 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-400 hover:border-forest hover:text-forest transition-colors text-2xl"
              >
                +
              </button>
            </div>
          </div>
        )}
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

      {cropFile && (
        <PhotoCropPicker
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropFile(null)}
        />
      )}
    </form>
  )
}
