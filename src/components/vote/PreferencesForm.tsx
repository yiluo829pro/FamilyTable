import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

interface Props {
  eventId: number
  guestName: string
  onSubmitted?: () => void
}

const ALLERGY_OPTIONS = ['Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Eggs', 'Dairy', 'Gluten', 'Soy', 'Sesame']
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Halal', 'Kosher', 'Low-Carb', 'Low-Sodium']

export default function PreferencesForm({ eventId, guestName, onSubmitted }: Props) {
  const [allergies, setAllergies] = useState<string[]>([])
  const [dietaryNotes, setDietaryNotes] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val])
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('guest_preferences').insert({
        event_id: eventId,
        guest_name: guestName,
        allergies,
        dietary_notes: dietaryNotes,
        free_text: freeText || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setSubmitted(true)
      onSubmitted?.()
    },
  })

  if (submitted) return (
    <div className="max-w-xl mx-auto text-center py-10">
      <div className="text-4xl mb-3">✅</div>
      <h2 className="font-heading text-xl font-semibold text-forest mb-2">Thanks, {guestName}!</h2>
      <p className="text-stone-500 text-sm">Your dietary preferences have been saved.</p>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-forest mb-1">Your Preferences</h2>
        <p className="text-stone-500 text-sm">Help the host plan a meal that works for everyone.</p>
      </div>

      <div>
        <label className="label">Allergies</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ALLERGY_OPTIONS.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => toggle(allergies, setAllergies, a)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                allergies.includes(a)
                  ? 'bg-red-500 text-white border-red-500'
                  : 'border-stone-200 text-stone-600 hover:border-red-300'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Dietary preferences</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {DIETARY_OPTIONS.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => toggle(dietaryNotes, setDietaryNotes, d)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                dietaryNotes.includes(d)
                  ? 'bg-forest text-white border-forest'
                  : 'border-stone-200 text-stone-600 hover:border-forest'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Anything else?</label>
        <textarea
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          className="input-field min-h-[80px] resize-y"
          placeholder="Any other notes for the host…"
        />
      </div>

      {mutation.isError && (
        <p className="text-red-500 text-sm">Failed to save. Please try again.</p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="btn-primary w-full"
      >
        {mutation.isPending ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  )
}
