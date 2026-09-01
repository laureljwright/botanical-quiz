export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isCorrectAnswer(answer: string, correct: string): boolean {
  return normalizeAnswer(answer) === normalizeAnswer(correct)
}
