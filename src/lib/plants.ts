import { supabase, PHOTO_BUCKET } from './supabaseClient'
import type { NewPlant, Plant, PlantWithStats, QuizStats } from './types'

export async function fetchPlantsWithStats(): Promise<PlantWithStats[]> {
  const { data: plants, error: plantsError } = await supabase
    .from('plants')
    .select('*')
    .order('week_added', { ascending: true })
    .order('created_at', { ascending: true })
  if (plantsError) throw plantsError

  const { data: stats, error: statsError } = await supabase
    .from('quiz_stats')
    .select('*')
  if (statsError) throw statsError

  const statsByPlantId = new Map<string, QuizStats>(
    (stats ?? []).map((s) => [s.plant_id, s]),
  )

  return (plants ?? []).map((plant) => ({
    ...plant,
    stats: statsByPlantId.get(plant.id) ?? null,
  }))
}

export async function fetchPlant(id: string): Promise<Plant | null> {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createPlant(plant: NewPlant): Promise<Plant> {
  const { data, error } = await supabase
    .from('plants')
    .insert(plant)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePlant(
  id: string,
  plant: Partial<NewPlant>,
): Promise<Plant> {
  const { data, error } = await supabase
    .from('plants')
    .update(plant)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlant(id: string): Promise<void> {
  const { error } = await supabase.from('plants').delete().eq('id', id)
  if (error) throw error
}

export async function uploadPlantPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function getNextWeekNumber(): Promise<number> {
  const { data, error } = await supabase
    .from('plants')
    .select('week_added')
    .order('week_added', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.week_added ?? 1
}

export async function recordQuizResult(
  plantId: string,
  correct: boolean,
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from('quiz_stats')
    .select('*')
    .eq('plant_id', plantId)
    .maybeSingle()
  if (fetchError) throw fetchError

  const timesSeen = (existing?.times_seen ?? 0) + 1
  const timesCorrect = (existing?.times_correct ?? 0) + (correct ? 1 : 0)

  const { error } = await supabase.from('quiz_stats').upsert({
    plant_id: plantId,
    times_seen: timesSeen,
    times_correct: timesCorrect,
    last_seen_at: new Date().toISOString(),
  })
  if (error) throw error
}
