export interface Plant {
  id: string
  botanical_name: string
  common_name: string
  type: string
  origin: string
  family_name: string
  light: string
  water: string
  fun_fact: string | null
  photo_urls: string[]
  week_added: number
  created_at: string
}

export type NewPlant = Omit<Plant, 'id' | 'created_at'>

export interface QuizStats {
  plant_id: string
  times_seen: number
  times_correct: number
  last_seen_at: string | null
}

export interface PlantWithStats extends Plant {
  stats: QuizStats | null
}

export const PLANT_FIELDS = [
  'botanical_name',
  'common_name',
  'type',
  'origin',
  'family_name',
  'light',
  'water',
] as const

export type PlantField = (typeof PLANT_FIELDS)[number]

export const FIELD_LABELS: Record<PlantField, string> = {
  botanical_name: 'Botanical Name',
  common_name: 'Common Name',
  type: 'Type',
  origin: 'Origin',
  family_name: 'Family Name',
  light: 'Light',
  water: 'Water',
}
