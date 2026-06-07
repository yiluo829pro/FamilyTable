interface Props {
  value: number | null
  onChange: (v: number) => void
  readonly?: boolean
}

export default function StarRating({ value, onChange, readonly = false }: Props) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange(star)}
          className={`text-2xl transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
          aria-label={`${star} star`}
        >
          <span className={star <= (value ?? 0) ? 'text-amber' : 'text-stone-200'}>★</span>
        </button>
      ))}
    </div>
  )
}
