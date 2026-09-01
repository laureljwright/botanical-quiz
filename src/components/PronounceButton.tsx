import { pronounce, speechSupported } from '../lib/speech'

export function PronounceButton({ text }: { text: string }) {
  if (!speechSupported) return null
  return (
    <button
      type="button"
      className="pronounce-btn"
      aria-label={`Pronounce ${text || 'field'}`}
      onClick={() => pronounce(text)}
      disabled={!text.trim()}
    >
      🔊
    </button>
  )
}
