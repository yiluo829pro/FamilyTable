interface Props {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  label?: string
}

export default function TagChips({ options, selected, onChange, label }: Props) {
  const toggle = (tag: string) => {
    onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag])
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              selected.includes(tag)
                ? 'bg-forest text-white border-forest'
                : 'border-stone-200 text-stone-600 hover:border-forest'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
