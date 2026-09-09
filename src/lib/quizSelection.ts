import type { PlantWithStats } from './types'

export interface QuizPick {
  plant: PlantWithStats
  /** Plant ids not yet shown in the current cycle, after this pick. Pass back in next call. */
  remainingIds: string[]
}

/**
 * Picks the next quiz plant from a "cycle bag": every plant is guaranteed to
 * be shown exactly once before any plant repeats. `remainingIds` tracks which
 * plants are still left in the current cycle — when it runs out (or doesn't
 * match the current plant list), a fresh cycle starts with every plant.
 *
 * Within a cycle, the plant is chosen with a weighted random pick so plants
 * with lower accuracy and plants added most recently are more likely to come
 * up earlier — but weighting only affects order, never whether a plant shows
 * up, so nothing gets left out.
 */
export function pickNextPlant(plants: PlantWithStats[], remainingIds: string[]): QuizPick | null {
  if (plants.length === 0) return null

  const validIds = new Set(plants.map((p) => p.id))
  let cycleIds = remainingIds.filter((id) => validIds.has(id))
  if (cycleIds.length === 0) {
    cycleIds = plants.map((p) => p.id)
  }

  const pool = plants.filter((p) => cycleIds.includes(p.id))
  const maxWeek = Math.max(...plants.map((p) => p.week_added))

  const weighted = pool.map((plant) => {
    const seen = plant.stats?.times_seen ?? 0
    const correct = plant.stats?.times_correct ?? 0
    const accuracy = seen > 0 ? correct / seen : 0
    const weaknessWeight = 1 - accuracy + 0.15
    const recencyWeight = plant.week_added === maxWeek ? 1.75 : 1
    const noviceWeight = seen === 0 ? 1.5 : 1
    return { plant, weight: weaknessWeight * recencyWeight * noviceWeight }
  })

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
  let r = Math.random() * totalWeight
  let picked = weighted[weighted.length - 1].plant
  for (const w of weighted) {
    r -= w.weight
    if (r <= 0) {
      picked = w.plant
      break
    }
  }

  return {
    plant: picked,
    remainingIds: cycleIds.filter((id) => id !== picked.id),
  }
}
