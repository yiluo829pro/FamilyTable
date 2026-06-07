import { useState, useRef } from 'react'
import type { Drink } from '../../types'
import {
  COFFEE_ROASTERS, WINE_PRODUCERS, BREWERIES, SPIRIT_BRANDS, TEA_BRANDS, NA_BRANDS,
  ROAST_LEVELS, COFFEE_PROCESSES, BREW_METHODS, WINE_TYPES, WINE_VARIETALS, WINE_REGIONS,
  BEER_STYLES, BEER_FORMATS, SPIRIT_TYPES, SAKE_TYPES, TEA_TYPES, NA_SUB_TYPES,
  COFFEE_TASTING_NOTES, WINE_TASTING_NOTES, BEER_TASTING_NOTES, SPIRITS_TASTING_NOTES,
  SAKE_TASTING_NOTES, TEA_TASTING_NOTES, NA_TASTING_NOTES, COFFEE_ORIGINS, WINE_REGIONS as WR,
  SAKE_PREFECTURES, BREW_TEMPS, STEEP_TIMES, TEA_ORIGINS, SERVING_TEMPS, PRICE_RANGES, OCCASIONS,
} from '../../data/seeds'
import SearchableDropdown from '../ui/SearchableDropdown'
import TagChips from '../ui/TagChips'
import StarRating from '../ui/StarRating'
import { uploadPhoto } from '../../lib/uploadPhoto'

export interface DrinkFormData {
  name: string
  brand: string
  sub_type: Drink['sub_type']
  photo_url: string
  tasting_notes: string[]
  rating: number | null
  status: Drink['status']
  personal_notes: string
  roast_level: string
  process: string
  origin_country: string
  brew_method: string
  blend_name: string
  wine_type: string
  varietal: string
  producer: string
  vintage_year: string
  wine_region: string
  abv: string
  price_range: string
  occasion: string
  brewery: string
  beer_style: string
  beer_abv: string
  ibu: string
  beer_format: string
  spirit_type: string
  distillery: string
  age_statement: string
  spirit_abv: string
  cocktail_notes: string
  sake_type: string
  sake_brewery: string
  sake_region: string
  smv: string
  serving_temp: string
  tea_type: string
  tea_brand: string
  tea_origin: string
  brew_temp: string
  steep_time: string
  na_sub_type: string
  na_brand: string
  flavor_variant: string
}

const SUB_TYPES: Array<{ value: Drink['sub_type']; label: string }> = [
  { value: 'coffee', label: '☕ Coffee' },
  { value: 'wine', label: '🍷 Wine' },
  { value: 'beer', label: '🍺 Beer' },
  { value: 'spirits', label: '🥃 Spirits' },
  { value: 'sake', label: '🍶 Sake / Asian' },
  { value: 'tea', label: '🍵 Tea' },
  { value: 'non_alcoholic', label: '🧃 Non-Alcoholic' },
]

const STATUSES: Array<{ value: Drink['status']; label: string }> = [
  { value: 'tried_loved', label: 'Tried & Loved' },
  { value: 'tried', label: 'Tried' },
  { value: 'wishlist', label: 'Wishlist' },
]

function emptyForm(): DrinkFormData {
  return {
    name: '', brand: '', sub_type: 'coffee', photo_url: '', tasting_notes: [],
    rating: null, status: 'wishlist', personal_notes: '',
    roast_level: '', process: '', origin_country: '', brew_method: '', blend_name: '',
    wine_type: '', varietal: '', producer: '', vintage_year: '', wine_region: '',
    abv: '', price_range: '', occasion: '',
    brewery: '', beer_style: '', beer_abv: '', ibu: '', beer_format: '',
    spirit_type: '', distillery: '', age_statement: '', spirit_abv: '', cocktail_notes: '',
    sake_type: '', sake_brewery: '', sake_region: '', smv: '', serving_temp: '',
    tea_type: '', tea_brand: '', tea_origin: '', brew_temp: '', steep_time: '',
    na_sub_type: '', na_brand: '', flavor_variant: '',
  }
}

function drinkToForm(d: Drink): DrinkFormData {
  return {
    name: d.name, brand: d.brand ?? '', sub_type: d.sub_type, photo_url: d.photo_url ?? '',
    tasting_notes: d.tasting_notes, rating: d.rating, status: d.status,
    personal_notes: d.personal_notes ?? '',
    roast_level: d.roast_level ?? '', process: d.process ?? '',
    origin_country: d.origin_country ?? '', brew_method: d.brew_method ?? '',
    blend_name: d.blend_name ?? '', wine_type: d.wine_type ?? '',
    varietal: d.varietal ?? '', producer: d.producer ?? '',
    vintage_year: d.vintage_year?.toString() ?? '', wine_region: d.wine_region ?? '',
    abv: d.abv?.toString() ?? '', price_range: d.price_range ?? '', occasion: d.occasion ?? '',
    brewery: d.brewery ?? '', beer_style: d.beer_style ?? '',
    beer_abv: d.beer_abv?.toString() ?? '', ibu: d.ibu?.toString() ?? '',
    beer_format: d.beer_format ?? '', spirit_type: d.spirit_type ?? '',
    distillery: d.distillery ?? '', age_statement: d.age_statement?.toString() ?? '',
    spirit_abv: d.spirit_abv?.toString() ?? '', cocktail_notes: d.cocktail_notes ?? '',
    sake_type: d.sake_type ?? '', sake_brewery: d.sake_brewery ?? '',
    sake_region: d.sake_region ?? '', smv: d.smv?.toString() ?? '',
    serving_temp: d.serving_temp ?? '', tea_type: d.tea_type ?? '',
    tea_brand: d.tea_brand ?? '', tea_origin: d.tea_origin ?? '',
    brew_temp: d.brew_temp ?? '', steep_time: d.steep_time ?? '',
    na_sub_type: d.na_sub_type ?? '', na_brand: d.na_brand ?? '',
    flavor_variant: d.flavor_variant ?? '',
  }
}

interface Props {
  initialData?: Drink
  onSubmit: (data: DrinkFormData) => Promise<void>
  submitLabel?: string
}

export default function DrinkForm({ initialData, onSubmit, submitLabel = 'Save Drink' }: Props) {
  const [form, setForm] = useState<DrinkFormData>(initialData ? drinkToForm(initialData) : emptyForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof DrinkFormData>(k: K, v: DrinkFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const tastingOptions = {
    coffee: COFFEE_TASTING_NOTES, wine: WINE_TASTING_NOTES, beer: BEER_TASTING_NOTES,
    spirits: SPIRITS_TASTING_NOTES, sake: SAKE_TASTING_NOTES, tea: TEA_TASTING_NOTES,
    non_alcoholic: NA_TASTING_NOTES,
  }[form.sub_type]

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

      {/* Sub-type selector */}
      <div>
        <label className="label">Type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SUB_TYPES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => set('sub_type', s.value)}
              className={`text-sm px-3 py-2 rounded-xl border transition-colors text-center ${
                form.sub_type === s.value ? 'bg-forest text-white border-forest' : 'border-stone-200 text-stone-600 hover:border-forest'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="label">Name *</label>
        <input type="text" required value={form.name}
          onChange={e => set('name', e.target.value)}
          className="input-field" placeholder="e.g. Ethiopian Yirgacheffe" />
      </div>

      {/* Brand */}
      <div>
        <SearchableDropdown
          label="Brand / Producer"
          options={
            form.sub_type === 'coffee' ? COFFEE_ROASTERS :
            form.sub_type === 'wine' ? WINE_PRODUCERS :
            form.sub_type === 'beer' ? BREWERIES :
            form.sub_type === 'spirits' ? SPIRIT_BRANDS :
            form.sub_type === 'tea' ? TEA_BRANDS : NA_BRANDS
          }
          value={form.brand}
          onChange={v => set('brand', v)}
          placeholder="Search brand…"
        />
      </div>

      {/* Coffee-specific fields */}
      {form.sub_type === 'coffee' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Roast Level</label>
              <select value={form.roast_level} onChange={e => set('roast_level', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {ROAST_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Process</label>
              <select value={form.process} onChange={e => set('process', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {COFFEE_PROCESSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <SearchableDropdown label="Origin" options={COFFEE_ORIGINS} value={form.origin_country} onChange={v => set('origin_country', v)} placeholder="Country of origin" />
            <div>
              <label className="label">Brew Method</label>
              <select value={form.brew_method} onChange={e => set('brew_method', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {BREW_METHODS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Blend Name</label>
            <input type="text" value={form.blend_name} onChange={e => set('blend_name', e.target.value)} className="input-field" placeholder="e.g. Seasonal blend" />
          </div>
        </div>
      )}

      {/* Wine-specific fields */}
      {form.sub_type === 'wine' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Wine Type</label>
              <select value={form.wine_type} onChange={e => set('wine_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {WINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <SearchableDropdown label="Varietal" options={WINE_VARIETALS} value={form.varietal} onChange={v => set('varietal', v)} placeholder="e.g. Pinot Noir" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <SearchableDropdown label="Producer" options={WINE_PRODUCERS} value={form.producer} onChange={v => set('producer', v)} placeholder="Winery name" />
            <div>
              <label className="label">Vintage Year</label>
              <input type="number" min="1900" max="2030" value={form.vintage_year} onChange={e => set('vintage_year', e.target.value)} className="input-field" placeholder="e.g. 2019" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <SearchableDropdown label="Region" options={WR} value={form.wine_region} onChange={v => set('wine_region', v)} placeholder="Wine region" />
            <div>
              <label className="label">ABV %</label>
              <input type="number" step="0.1" value={form.abv} onChange={e => set('abv', e.target.value)} className="input-field" placeholder="e.g. 13.5" />
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
        </div>
      )}

      {/* Beer-specific fields */}
      {form.sub_type === 'beer' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <SearchableDropdown label="Brewery" options={BREWERIES} value={form.brewery} onChange={v => set('brewery', v)} placeholder="Brewery name" />
            <div>
              <label className="label">Style</label>
              <select value={form.beer_style} onChange={e => set('beer_style', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {BEER_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">ABV %</label>
              <input type="number" step="0.1" value={form.beer_abv} onChange={e => set('beer_abv', e.target.value)} className="input-field" placeholder="5.0" />
            </div>
            <div>
              <label className="label">IBU</label>
              <input type="number" value={form.ibu} onChange={e => set('ibu', e.target.value)} className="input-field" placeholder="40" />
            </div>
            <div>
              <label className="label">Format</label>
              <select value={form.beer_format} onChange={e => set('beer_format', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {BEER_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Spirits-specific fields */}
      {form.sub_type === 'spirits' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Spirit Type</label>
              <select value={form.spirit_type} onChange={e => set('spirit_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {SPIRIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <SearchableDropdown label="Distillery" options={SPIRIT_BRANDS} value={form.distillery} onChange={v => set('distillery', v)} placeholder="Distillery name" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Age Statement (years)</label>
              <input type="number" value={form.age_statement} onChange={e => set('age_statement', e.target.value)} className="input-field" placeholder="12" />
            </div>
            <div>
              <label className="label">ABV %</label>
              <input type="number" step="0.1" value={form.spirit_abv} onChange={e => set('spirit_abv', e.target.value)} className="input-field" placeholder="40" />
            </div>
          </div>
          <div>
            <label className="label">Cocktail Notes</label>
            <textarea value={form.cocktail_notes} onChange={e => set('cocktail_notes', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="How to use in cocktails…" />
          </div>
        </div>
      )}

      {/* Sake/Asian fields */}
      {form.sub_type === 'sake' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select value={form.sake_type} onChange={e => set('sake_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {SAKE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Brewery</label>
              <input type="text" value={form.sake_brewery} onChange={e => set('sake_brewery', e.target.value)} className="input-field" placeholder="Brewery name" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <SearchableDropdown label="Region" options={SAKE_PREFECTURES} value={form.sake_region} onChange={v => set('sake_region', v)} placeholder="Prefecture" />
            <div>
              <label className="label">SMV</label>
              <input type="number" step="0.1" value={form.smv} onChange={e => set('smv', e.target.value)} className="input-field" placeholder="+3" />
            </div>
            <div>
              <label className="label">Serving Temp</label>
              <select value={form.serving_temp} onChange={e => set('serving_temp', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {SERVING_TEMPS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tea fields */}
      {form.sub_type === 'tea' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tea Type</label>
              <select value={form.tea_type} onChange={e => set('tea_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {TEA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <SearchableDropdown label="Brand" options={TEA_BRANDS} value={form.tea_brand} onChange={v => set('tea_brand', v)} placeholder="Tea brand" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <SearchableDropdown label="Origin" options={TEA_ORIGINS} value={form.tea_origin} onChange={v => set('tea_origin', v)} placeholder="Origin" />
            <div>
              <label className="label">Brew Temp</label>
              <select value={form.brew_temp} onChange={e => set('brew_temp', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {BREW_TEMPS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Steep Time</label>
              <select value={form.steep_time} onChange={e => set('steep_time', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {STEEP_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Non-alcoholic fields */}
      {form.sub_type === 'non_alcoholic' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Sub-type</label>
              <select value={form.na_sub_type} onChange={e => set('na_sub_type', e.target.value)} className="input-field">
                <option value="">Select…</option>
                {NA_SUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <SearchableDropdown label="Brand" options={NA_BRANDS} value={form.na_brand} onChange={v => set('na_brand', v)} placeholder="Brand" />
          </div>
          <div>
            <label className="label">Flavor Variant</label>
            <input type="text" value={form.flavor_variant} onChange={e => set('flavor_variant', e.target.value)} className="input-field" placeholder="e.g. Yuzu Ginger" />
          </div>
        </div>
      )}

      {/* Tasting notes */}
      <TagChips label="Tasting Notes" options={tastingOptions} selected={form.tasting_notes} onChange={v => set('tasting_notes', v)} />

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
          className="input-field min-h-[80px] resize-y" placeholder="Your thoughts, memories, pairings…" />
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      <button type="submit" disabled={loading || photoUploading} className="btn-primary w-full">
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
