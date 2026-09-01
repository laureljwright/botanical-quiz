export const speechSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

export function pronounce(text: string) {
  if (!speechSupported || !text.trim()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.8
  window.speechSynthesis.speak(utterance)
}
