import { useState, useRef } from 'react'
import type { Experience, TravelMoment } from '../../types'
import {
  CUISINES, PRICE_RANGES, OCCASIONS, AMBIANCE_TAGS, CAFE_SPECIALTIES, WOULD_RETURN,
} from '../../data/seeds'
import SearchableDropdown from '../ui/SearchableDropdown'
import TagChips from '../ui/TagChips'
import StarRating from '../ui/StarRating'
import { uploadPhoto } from '../../lib/uploadPhoto'

export interface TravelMomentDraft {
  item_name: string
  where_eaten: string
  memory_note: string
  photo_url: string
}

export interface ExperienceFormData {
  name: string
  sub_category: Experience['sub_category']
  photo_url: string
  rating: number | null
  status: string
  personal_notes: string
  cuisine: string
  address: string
  city: string
  country: string
  price_range: string
  occasion: string
  ambiance_tags: string[]
  dishes_tried: string
  standout_dish: string
  would_return: string
  cafe_specialty: string
  work_friendly: boolean | null
  wifi_available: boolean | null
  trip_name: string
  trip_city: string
  trip_country: string
  trip_start_date: string
  trip_end_date: string
  author: string
  cuisine_focus: string
  year_published: string
  publisher: string
  favorite_recipes: string
  travel_moments: TravelMomentDraft[]
}

const SUB_CATS: Array<{ value: Experience['sub_category']; label: string }> = [
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'cafe', label: '☕ Café' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'cookbook', label: '📖 Cookbook' },
]

const STATUSES = [
  { value: 'tried_loved', label: 'Tried & Loved' },
  { value: 'tried', label: 'Tried' },
  { value: 'wishlist', label: 'Wishlist' },
]

function emptyForm(): ExperienceFormData {
  return {
    name: '', sub_category: 'restaurant', photo_url: '', rating: null,
    status: 'wishlist', personal_notes: '',
    cuisine: '', address: '', city: '', country: '', price_range: '', occasion: '',
    ambiance_tags: [], dishes_tried: '', standout_dish: '', would_return: '',
    cafe_specialty: '', work_friendly: null, wifi_available: null,
    trip_name: '', trip_city: '', trip_country: '', trip_start_date: '', trip_end_date: '',
    author: '', cuisine_focus: '', year_published: '', publisher: '', favorite_recipes: '',
    travel_moments: [],
  }
}

function expToForm(e: Experience, moments: TravelMoment[] = []): ExperienceFormData {
  return {
    name: e.name, sub_category: e.sub_category, photo_url: e.photo_url ?? '',
    rating: e.rating, status: e.status, personal_notes: e.personal_notes ?? '',
    cuisine: e.cuisine ?? '', address: e.address ?? '', city: e.city ?? '',
    country: e.country ?? '', price_range: e.price_range ?? '', occasion: e.occasion ?? '',
    ambiance_tags: e.ambiance_tags, dishes_tried: e.dishes_tried ?? '',
    standout_dish: e.standout_dish ?? '', would_return: e.would_return ?? '',
    cafe_specialty: e.cafe_specialty ?? '', work_friendly: e.work_friendly,
    wifi_available: e.wifi_available,
    trip_name: e.trip_name ?? '', trip_city: e.trip_city ?? '',
    trip_country: e.trip_country ?? '', trip_start_date: e.trip_start_date ?? '',
    trip_end_date: e.trip_end_date ?? '', author: e.author ?? '',
    cuisine_focus: e.cuisine_focus ?? '', year_published: e.year_published?.toString() ?? '',
    publisher: e.publisher ?? '', favorite_recipes: e.favorite_recipes ?? '',
    travel_moments: moments.map(m => ({
      item_name: m.item_name, where_eaten: m.where_eaten ?? '',
      memory_note: m.memory_note ?? '', photo_url: m.photo_url ?? '',
    })),
  }
}

interface Props {
  initialData?: Experience
  initialMoments?: TravelMoment[]
  onSubmit: (data: ExperienceFormData) => Promise<void>
  submitLabel?: string
}

export { expToForm }

export default function ExperienceForm({ initialData, initialMoments, onSubmit, submitLabel = 'Save Experience' }: Props) {
  const [form, setForm] = useState<ExperienceFormData>(
    initialData ? expToForm(initialData, initialMoments) : emptyForm()
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ExperienceFormData>(k: K, v: ExperienceFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const url = await uploadPhoto(file)
      set('photo_url', url)
    } catch {
      setError('Photo upload failed')
    } finally {
      setPhotoUploading(false)
    }
  }

  const addMoment = () => setForm(f => ({
    ...f, travel_moments: [...f.travel_moments, { item_name: '', where_eaten: '', memory_note: '', photo_url: '' }]
  }))

  const updateMoment = (i: number, field: keyof TravelMomentDraft, value: string) => {
    setForm(f => {
      const moments = [...f.travel_moments]
      moments[i] = { ...moments[i], [field]: value }
      return { ...f, travel_moments: moments }
    })
  }

  const removeMoment = (i: number) => {
    setForm(f => ({ ...f, travel_moments: f.travel_moments.filter((_, idx) => idx !== i) }))
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

  const isVenue = form.sub_category === 'restaurant' || form.sub_category === 'cafe'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo */}
      <div>
        <label className="label">Photo</label>
        {form.photo_url && (
          <img src={form.photo_url} alt="preview" className="w-full h-48 object-cover rounded-xl mb-2" />
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={photoUploading}
          className="btn-outline text-sm w-full">
          {photoUploading ? 'Uploading…' : form.photo_url ? 'Change photo' : 'Upload photo'}
        </button>
      </div>

      {/* Sub-category */}
      <div>
        <label className="label">Type *</label>
        <div className="grid grid-cols-2 gap-2">
          {SUB_CATS.map(s => (
            <button key={s.value} type="button" onClick={() => set('sub_category', s.value)}
              className={`text-sm px-3 py-2 rounded-xl border transition-colors text-center ${
                form.sub_category === s.value ? 'bg-forest text-white border-forest' : 'border-stone-200 text-stone-600 hover:border-forest'
              }`}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="label">Name *</label>
        <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
          className="input-field" placeholder={
            form.sub_category === 'restaurant' ? 'Restaurant name' :
            form.sub_category === 'cafe' ? 'Café name' :
            form.sub_category === 'travel' ? 'Trip name' : 'Cookbook title'
          } />
      </div>

      {/* Restaurant/Café shared */}
      {isVenue && (
        <div className="space-y-4">
          <SearchableDropdown label="Cuisine" options={CUISINES} value={form.cuisine} onChange={v => set('cuisine', v)} placeholder="Cuisine type" />
          <div>
            <label className="label">Address</label>
            <input type="text" value={form.address} onChange={e => set('address', e.target.value)} className="input-field" placeholder="Street address" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)} className="input-field" placeholder="City" />
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" value={form.country} onChange={e => set('country', e.target.value)} className="input-field" placeholder="Country" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Price Range</label>
              <select value={form.price_range} onChange={e => set('price_range', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {PRICE_RANGES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Occasion</label>
              <select value={form.occasion} onChange={e => set('occasion', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <TagChips label="Ambiance" options={AMBIANCE_TAGS} selected={form.ambiance_tags} onChange={v => set('ambiance_tags', v)} />
          <div>
            <label className="label">Dishes Tried</label>
            <textarea value={form.dishes_tried} onChange={e => set('dishes_tried', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="List dishes you tried…" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Standout Dish</label>
              <input type="text" value={form.standout_dish} onChange={e => set('standout_dish', e.target.value)} className="input-field" placeholder="Best dish" />
            </div>
            <div>
              <label className="label">Would Return?</label>
              <select value={form.would_return} onChange={e => set('would_return', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {WOULD_RETURN.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Café extra */}
      {form.sub_category === 'cafe' && (
        <div className="space-y-4">
          <div>
            <label className="label">Café Specialty</label>
            <select value={form.cafe_specialty} onChange={e => set('cafe_specialty', e.target.value)} className="input-field">
              <option value="">Select…</option>
              {CAFE_SPECIALTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
              <input type="checkbox" checked={form.work_friendly === true}
                onChange={e => set('work_friendly', e.target.checked ? true : null)}
                className="rounded" />
              Work friendly
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
              <input type="checkbox" checked={form.wifi_available === true}
                onChange={e => set('wifi_available', e.target.checked ? true : null)}
                className="rounded" />
              WiFi available
            </label>
          </div>
        </div>
      )}

      {/* Travel */}
      {form.sub_category === 'travel' && (
        <div className="space-y-4">
          <div>
            <label className="label">Trip Name</label>
            <input type="text" value={form.trip_name} onChange={e => set('trip_name', e.target.value)} className="input-field" placeholder="e.g. Tokyo Spring 2024" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input type="text" value={form.trip_city} onChange={e => set('trip_city', e.target.value)} className="input-field" placeholder="City" />
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" value={form.trip_country} onChange={e => set('trip_country', e.target.value)} className="input-field" placeholder="Country" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={form.trip_start_date} onChange={e => set('trip_start_date', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" value={form.trip_end_date} onChange={e => set('trip_end_date', e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Food moments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Food Moments</label>
              <button type="button" onClick={addMoment} className="text-sm text-forest hover:underline">+ Add moment</button>
            </div>
            <div className="space-y-4">
              {form.travel_moments.map((m, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-600">Moment {i + 1}</span>
                    <button type="button" onClick={() => removeMoment(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  </div>
                  <input type="text" value={m.item_name} onChange={e => updateMoment(i, 'item_name', e.target.value)}
                    className="input-field" placeholder="What did you eat?" />
                  <input type="text" value={m.where_eaten} onChange={e => updateMoment(i, 'where_eaten', e.target.value)}
                    className="input-field" placeholder="Where? (restaurant, market, etc.)" />
                  <textarea value={m.memory_note} onChange={e => updateMoment(i, 'memory_note', e.target.value)}
                    className="input-field min-h-[60px] resize-y" placeholder="Memory or note…" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cookbook */}
      {form.sub_category === 'cookbook' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Author</label>
              <input type="text" value={form.author} onChange={e => set('author', e.target.value)} className="input-field" placeholder="Author name" />
            </div>
            <SearchableDropdown label="Cuisine Focus" options={CUISINES} value={form.cuisine_focus} onChange={v => set('cuisine_focus', v)} placeholder="Main cuisine" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Year Published</label>
              <input type="number" min="1900" max="2030" value={form.year_published} onChange={e => set('year_published', e.target.value)} className="input-field" placeholder="2023" />
            </div>
            <div>
              <label className="label">Publisher</label>
              <input type="text" value={form.publisher} onChange={e => set('publisher', e.target.value)} className="input-field" placeholder="Publisher" />
            </div>
          </div>
          <div>
            <label className="label">Favorite Recipes</label>
            <textarea value={form.favorite_recipes} onChange={e => set('favorite_recipes', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="List favorite recipes from this book…" />
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="label">Rating</label>
        <StarRating value={form.rating} onChange={v => set('rating', v)} />
      </div>

      {/* Status */}
      <div>
        <label className="label">Status</label>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s.value} type="button" onClick={() => set('status', s.value)}
              className={`text-sm px-4 py-2 rounded-xl border transition-colors ${
                form.status === s.value ? 'bg-forest text-white border-forest' : 'border-stone-200 text-stone-600 hover:border-forest'
              }`}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Personal notes */}
      <div>
        <label className="label">Personal Notes</label>
        <textarea value={form.personal_notes} onChange={e => set('personal_notes', e.target.value)}
          className="input-field min-h-[80px] resize-y" placeholder="Your thoughts, impressions…" />
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      <button type="submit" disabled={loading || photoUploading} className="btn-primary w-full">
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
