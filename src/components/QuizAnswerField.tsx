import { PronounceButton } from './PronounceButton'

export type FieldStatus = 'idle' | 'correct' | 'incorrect'

export function QuizAnswerField({
  label,
  value,
  onChange,
  status,
  correctValue,
  pronounceText,
  disabled,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  status: FieldStatus
  correctValue?: string
  /** Only pass once graded, so pronunciation can't be used to guess spelling beforehand. */
  pronounceText?: string
  disabled?: boolean
  /** When given, the answer is picked from this list instead of typed. */
  options?: string[]
}) {
  return (
    <div className="field-row">
      <label className="field-row-label">
        {label}
        {pronounceText && <PronounceButton text={pronounceText} />}
      </label>
      {options ? (
        <select
          className={status !== 'idle' ? status : ''}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          className={status !== 'idle' ? status : ''}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      )}
      {status === 'incorrect' && correctValue && (
        <div className="field-hint">Correct: {correctValue}</div>
      )}
    </div>
  )
}
