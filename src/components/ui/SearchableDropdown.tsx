import { useState, useRef, useEffect } from 'react'

interface Props {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  label?: string
}

export default function SearchableDropdown({ options, value, onChange, placeholder = 'Search or type…', label }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
  const exactMatch = options.some(o => o.toLowerCase() === query.toLowerCase())

  const select = (v: string) => {
    onChange(v)
    setQuery(v)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {label && <label className="label">{label}</label>}
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input-field"
      />
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.map(o => (
            <button
              key={o}
              type="button"
              onMouseDown={() => select(o)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-cream transition-colors ${value === o ? 'text-forest font-medium' : 'text-stone-700'}`}
            >
              {o}
            </button>
          ))}
          {query && !exactMatch && (
            <button
              type="button"
              onMouseDown={() => select(query)}
              className="w-full text-left px-4 py-2 text-sm text-amber-dark hover:bg-amber/10 transition-colors border-t border-stone-100"
            >
              Add new: <strong>{query}</strong>
            </button>
          )}
          {filtered.length === 0 && !query && (
            <p className="px-4 py-2 text-sm text-stone-400">No options</p>
          )}
        </div>
      )}
    </div>
  )
}
