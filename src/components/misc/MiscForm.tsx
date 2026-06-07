import { useState, useRef } from 'react'
import type { MiscItem } from '../../types'
import {
  SNACK_BRANDS, CONDIMENT_BRANDS, NOODLE_BRANDS,
  SNACK_TYPES, CONDIMENT_TYPES, NOODLE_TYPES, BROTH_TYPES, BAKED_TYPES, BAKED_SOURCES,
  HEAT_LEVELS, SNACK_TASTING_NOTES, BAKED_TASTING_NOTES,
} from '../../data/seeds'
import SearchableDropdown from '../ui/SearchableDropdown'
import TagChips from '../ui/TagChips'
import StarRating from '../ui/StarRating'
import { uploadPhoto } from '../../lib/uploadPhoto'

export interface MiscFormData {
  name: string
  brand: string
  sub_category: MiscItem['sub_category']
  photo_url: string
  flavor_variant: string
  rating: number | null
  status: MiscItem['status']
  personal_notes: string
  where_to_buy: string
  snack_type: string
  heat_level: string
  tasting_notes: string[]
  condiment_type: string
  intensity: string
  noodle_type: string
  broth_type: string
  spice_level: string
  customization_notes: string
  baked_source: string
  baked_type: string
  bakery_brand: string
}

const SUB_CATS: Array<{ value: MiscItem['sub_category']; label: string }> = [
  { value: 'snacks', label: '🍿 Snacks' },
  { value: 'condiments', label: '🫙 Condiments' },
  { value: 'instant_noodles', label: '🍜 Instant Noodles' },
  { value: 'baked_goods', label: '🥐 Baked Goods' },
]

const STATUSES: Array<{ value: MiscItem['status']; label: string }> = [
  { value: 'tried_loved', label: 'Tried & Loved' },
  { value: 'tried', label: 'Tried' },
  { value: 'wishlist', label: 'Wishlist' },
]

function emptyForm(): MiscFormData {
  return {
    name: '', brand: '', sub_category: 'snacks', photo_url: '', flavor_variant: '',
    rating: null, status: 'wishlist', personal_notes: '', where_to_buy: '',
    snack_type: '', heat_level: '', tasting_notes: [],
    condiment_type: '', intensity: '',
    noodle_type: '', broth_type: '', spice_level: '', customization_notes: '',
    baked_source: '', baked_type: '', bakery_brand: '',
  }
}

function itemToForm(m: MiscItem): MiscFormData {
  return {
    name: m.name, brand: m.brand ?? '', sub_category: m.sub_category,
    photo_url: m.photo_url ?? '', flavor_variant: m.flavor_variant ?? '',
    rating: m.rating, status: m.status, personal_notes: m.personal_notes ?? '',
    where_to_buy: m.where_to_buy ?? '', snack_type: m.snack_type ?? '',
    heat_level: m.heat_level ?? '', tasting_notes: m.tasting_notes,
    condiment_type: m.condiment_type ?? '', intensity: m.intensity ?? '',
    noodle_type: m.noodle_type ?? '', broth_type: m.broth_type ?? '',
    spice_level: m.spice_level?.toString() ?? '', customization_notes: m.customization_notes ?? '',
    baked_source: m.baked_source ?? '', baked_type: m.baked_type ?? '',
    bakery_brand: m.bakery_brand ?? '',
  }
}

interface Props {
  initialData?: MiscItem
  onSubmit: (data: MiscFormData) => Promise<void>
  submitLabel?: string
}

export default function MiscForm({ initialData, onSubmit, submitLabel = 'Save Item' }: Props) {
  const [form, setForm] = useState<MiscFormData>(initialData ? itemToForm(initialData) : emptyForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof MiscFormData>(k: K, v: MiscFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const brandOptions = {
    snacks: SNACK_BRANDS, condiments: CONDIMENT_BRANDS,
    instant_noodles: NOODLE_BRANDS, baked_goods: [] as string[],
  }[form.sub_category]

  const tastingOptions = form.sub_category === 'baked_goods' ? BAKED_TASTING_NOTES : SNACK_TASTING_NOTES

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

      {/* Sub-category selector */}
      <div>
        <label className="label">Category *</label>
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
          className="input-field" placeholder="e.g. Lao Gan Ma Chili Crisp" />
      </div>

      {/* Brand */}
      {brandOptions.length > 0 ? (
        <SearchableDropdown label="Brand" options={brandOptions} value={form.brand} onChange={v => set('brand', v)} placeholder="Search brand…" />
      ) : (
        <div>
          <label className="label">Brand / Bakery</label>
          <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} className="input-field" placeholder="Brand or bakery name" />
        </div>
      )}

      {/* Snack-specific */}
      {form.sub_category === 'snacks' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Snack Type</label>
              <select value={form.snack_type} onChange={e => set('snack_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {SNACK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Heat Level</label>
              <select value={form.heat_level} onChange={e => set('heat_level', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {HEAT_LEVELS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Flavor Variant</label>
            <input type="text" value={form.flavor_variant} onChange={e => set('flavor_variant', e.target.value)} className="input-field" placeholder="e.g. Original, Spicy, BBQ" />
          </div>
        </div>
      )}

      {/* Condiments-specific */}
      {form.sub_category === 'condiments' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Condiment Type</label>
              <select value={form.condiment_type} onChange={e => set('condiment_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {CONDIMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Intensity</label>
              <select value={form.intensity} onChange={e => set('intensity', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {HEAT_LEVELS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Instant noodles specific */}
      {form.sub_category === 'instant_noodles' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Noodle Type</label>
              <select value={form.noodle_type} onChange={e => set('noodle_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {NOODLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Broth Type</label>
              <select value={form.broth_type} onChange={e => set('broth_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {BROTH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Spice Level (1–10)</label>
            <input type="number" min="1" max="10" value={form.spice_level} onChange={e => set('spice_level', e.target.value)} className="input-field" placeholder="5" />
          </div>
          <div>
            <label className="label">Customization Notes</label>
            <textarea value={form.customization_notes} onChange={e => set('customization_notes', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Add egg, reduce water, etc." />
          </div>
        </div>
      )}

      {/* Baked goods specific */}
      {form.sub_category === 'baked_goods' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select value={form.baked_type} onChange={e => set('baked_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {BAKED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Source</label>
              <select value={form.baked_source} onChange={e => set('baked_source', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {BAKED_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Bakery / Brand</label>
            <input type="text" value={form.bakery_brand} onChange={e => set('bakery_brand', e.target.value)} className="input-field" placeholder="e.g. Tartine" />
          </div>
        </div>
      )}

      {/* Tasting notes */}
      <TagChips label="Tasting Notes" options={tastingOptions} selected={form.tasting_notes} onChange={v => set('tasting_notes', v)} />

      {/* Where to buy */}
      <div>
        <label className="label">Where to Buy</label>
        <input type="text" value={form.where_to_buy} onChange={e => set('where_to_buy', e.target.value)} className="input-field" placeholder="e.g. H Mart, Amazon, local store" />
      </div>

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
          className="input-field min-h-[80px] resize-y" placeholder="Your thoughts…" />
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      <button type="submit" disabled={loading || photoUploading} className="btn-primary w-full">
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
