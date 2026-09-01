import type { PlantWithStats } from './types'

/**
 * Weighted pick for the next quiz round: plants with lower accuracy and
 * plants added most recently are favored, but every plant keeps a nonzero
 * chance so nothing drops out of rotation. Excludes recently-asked plants
 * when the pool is large enough to do so.
 */
export function pickNextPlant(
  plants: PlantWithStats[],
  recentIds: string[],
): PlantWithStats | null {
  if (plants.length === 0) return null

  const maxWeek = Math.max(...plants.map((p) => p.week_added))
  const pool =
    plants.length > recentIds.length
      ? plants.filter((p) => !recentIds.includes(p.id))
      : plants

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
  for (const w of weighted) {
    r -= w.weight
    if (r <= 0) return w.plant
  }
  return weighted[weighted.length - 1].plant
}
