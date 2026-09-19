import { useState } from 'react'

const OTHER = '__other__'

/**
 * Pick from values already used on other plants, or choose "Other…" to type a
 * new one. With no existing values yet (first plant), it's just a text box.
 */
export function ChoiceInput({
  id,
  value,
  onChange,
  options,
  required,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  options: string[]
  required?: boolean
}) {
  const [custom, setCustom] = useState(false)

  // Keep the current value selectable even if it isn't in the fetched list yet.
  const choices = value && !options.includes(value) ? [...options, value] : options

  if (choices.length === 0 || custom) {
    return (
      <>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required={required}
        />
        {choices.length > 0 && (
          <button type="button" className="choice-toggle" onClick={() => setCustom(false)}>
            Choose from list
          </button>
        )}
      </>
    )
  }

  return (
    <select
      id={id}
      value={value}
      required={required}
      onChange={(e) => {
        if (e.target.value === OTHER) {
          setCustom(true)
          onChange('')
        } else {
          onChange(e.target.value)
        }
      }}
    >
      <option value="">Select…</option>
      {choices.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      <option value={OTHER}>Other…</option>
    </select>
  )
}
