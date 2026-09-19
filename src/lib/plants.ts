import { supabase, PHOTO_BUCKET } from './supabaseClient'
import { CHOICE_FIELDS, distinctFieldValues } from './fieldOptions'
import type { NewPlant, Plant, PlantField, PlantWithStats, QuizStats } from './types'

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

/** Existing light/water values across all plants, for the dropdown choices. */
export async function fetchChoiceOptions(): Promise<Partial<Record<PlantField, string[]>>> {
  const { data, error } = await supabase.from('plants').select(CHOICE_FIELDS.join(','))
  if (error) throw error
  const rows = (data ?? []) as unknown as Partial<Record<PlantField, string>>[]
  return Object.fromEntries(CHOICE_FIELDS.map((f) => [f, distinctFieldValues(rows, f)]))
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

/**
 * iPhones default to saving photos as HEIC/HEIF, which most browsers (and
 * `<img>` tags) can't decode — an uploaded HEIC photo would silently fail to
 * render anywhere but Safari. Convert it to a normal JPEG before upload so
 * every plant photo actually displays for the quiz.
 */
async function convertHeicIfNeeded(file: File): Promise<File> {
  const looksHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  if (!looksHeic) return file

  try {
    const { default: heic2any } = await import('heic2any')
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
    const blob = Array.isArray(result) ? result[0] : result
    const newName = file.name.replace(/\.(heic|heif)$/i, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  } catch {
    // If conversion fails for any reason, upload the original rather than
    // blocking the whole flow — better a possibly-broken photo than none.
    return file
  }
}

const MAX_PHOTO_DIMENSION = 1600
const PHOTO_JPEG_QUALITY = 0.82

/**
 * Phone cameras routinely produce multi-megabyte, 12MP+ photos. Uploaded
 * as-is, those are slow (and on a weak connection, unreliable) to load back
 * in the quiz — which is what "sometimes an image doesn't load" usually
 * turns out to be. Downscale and recompress to a size that's still plenty
 * sharp on a phone screen but loads fast and consistently.
 */
async function resizeImage(file: File): Promise<File> {
  try {
    const objectUrl = URL.createObjectURL(file)
    try {
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Could not read image'))
        img.src = objectUrl
      })

      const { width, height } = img
      const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(width, height))
      if (scale === 1 && file.type === 'image/jpeg') return file

      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(width * scale))
      canvas.height = Math.max(1, Math.round(height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) return file
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', PHOTO_JPEG_QUALITY),
      )
      if (!blob) return file

      const newName = file.name.replace(/\.\w+$/, '') + '.jpg'
      return new File([blob], newName, { type: 'image/jpeg' })
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  } catch {
    // If anything goes wrong reading/redrawing the image, fall back to the
    // original file rather than blocking the upload.
    return file
  }
}

export async function uploadPlantPhoto(file: File): Promise<string> {
  const heicHandled = await convertHeicIfNeeded(file)
  const uploadFile = await resizeImage(heicHandled)
  const ext = uploadFile.name.split('.').pop() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, uploadFile)
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
