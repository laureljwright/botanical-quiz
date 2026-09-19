import { normalizeAnswer } from './match'
import type { PlantField } from './types'

/** Fields answered by picking from a list instead of typing. */
export const CHOICE_FIELDS: readonly PlantField[] = ['light', 'water']

export function isChoiceField(field: PlantField): boolean {
  return CHOICE_FIELDS.includes(field)
}

/**
 * Distinct, non-empty values already used for a field, sorted for display.
 * De-duplicated the same way answers are graded (case/spacing-insensitive),
 * so "FS / PS" and "fs/ps" don't show up as two separate choices.
 */
export function distinctFieldValues(
  plants: Partial<Record<PlantField, string>>[],
  field: PlantField,
): string[] {
  const seen = new Map<string, string>()
  for (const p of plants) {
    const value = (p[field] ?? '').trim()
    if (!value) continue
    const key = normalizeAnswer(value)
    if (!seen.has(key)) seen.set(key, value)
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b))
}
