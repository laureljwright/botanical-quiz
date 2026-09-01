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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  status: FieldStatus
  correctValue?: string
  /** Only pass once graded, so pronunciation can't be used to guess spelling beforehand. */
  pronounceText?: string
  disabled?: boolean
}) {
  return (
    <div className="field-row">
      <label className="field-row-label">
        {label}
        {pronounceText && <PronounceButton text={pronounceText} />}
      </label>
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
      {status === 'incorrect' && correctValue && (
        <div className="field-hint">Correct: {correctValue}</div>
      )}
    </div>
  )
}
