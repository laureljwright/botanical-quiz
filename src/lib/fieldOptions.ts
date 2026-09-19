import { normalizeAnswer } from './match'
import type { PlantField } from './types'

/** Fields answered by picking from a list instead of typing. */
export const CHOICE_FIELDS: readonly PlantField[] = ['light', 'water']

export type TextCase = 'first' | 'upper'

/**
 * Fields with a fixed capitalization convention: Botanical/Family Name start
 * with a capital (Genus, Family); Type is always all caps (e.g. "BLE S/T").
 */
const TEXT_CASE: Partial<Record<PlantField, TextCase>> = {
  botanical_name: 'first',
  family_name: 'first',
  type: 'upper',
}

export function fieldTextCase(field: PlantField): TextCase | undefined {
  return TEXT_CASE[field]
}

export function applyTextCase(value: string, textCase?: TextCase): string {
  if (textCase === 'upper') return value.toUpperCase()
  if (textCase === 'first') return value.charAt(0).toUpperCase() + value.slice(1)
  return value
}

/** What to tell the mobile keyboard so it starts in the right mode. */
export function autoCapitalizeFor(textCase?: TextCase): 'sentences' | 'characters' | 'off' {
  if (textCase === 'upper') return 'characters'
  if (textCase === 'first') return 'sentences'
  return 'off'
}

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
