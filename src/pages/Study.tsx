import { useEffect, useMemo, useState } from 'react'
import { TabBar } from '../components/TabBar'
import { fetchPlantsWithStats } from '../lib/plants'
import { FIELD_LABELS } from '../lib/types'
import type { PlantField, PlantWithStats } from '../lib/types'

const DETAIL_FIELDS: PlantField[] = ['origin', 'type', 'family_name', 'light', 'water']

type SortOrder = 'newest' | 'oldest'

export function Study() {
  const [plants, setPlants] = useState<PlantWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showFilters, setShowFilters] = useState(false)
  const [weekFilter, setWeekFilter] = useState('all')
  const [familyFilter, setFamilyFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPlantsWithStats()
        setPlants(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const weeks = useMemo(
    () => Array.from(new Set(plants.map((p) => p.week_added))).sort((a, b) => a - b),
    [plants],
  )
  const families = useMemo(
    () => Array.from(new Set(plants.map((p) => p.family_name).filter(Boolean))).sort(),
    [plants],
  )

  const visiblePlants = useMemo(() => {
    let list = plants
    if (weekFilter !== 'all') list = list.filter((p) => String(p.week_added) === weekFilter)
    if (familyFilter !== 'all') list = list.filter((p) => p.family_name === familyFilter)
    return [...list].sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return sortOrder === 'newest' ? diff : -diff
    })
  }, [plants, weekFilter, familyFilter, sortOrder])

  if (loading) return <div className="page-light screen-content">Loading…</div>
  if (error)
    return (
      <div className="page-light screen-content">
        <div className="error-text">{error}</div>
      </div>
    )

  return (
    <div className="page-light">
      <TabBar active="study" />
      <div className="screen-content">
        <div className="study-controls">
          <button
            type="button"
            className="study-filter-toggle"
            onClick={() => setShowFilters((s) => !s)}
          >
            Filters
          </button>
          <select
            className="study-sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            aria-label="Sort by"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
          </select>
        </div>

        {showFilters && (
          <div className="study-filters">
            <label className="study-filter-field">
              <span>Week</span>
              <select value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)}>
                <option value="all">All weeks</option>
                {weeks.map((w) => (
                  <option key={w} value={String(w)}>
                    Week {w}
                  </option>
                ))}
              </select>
            </label>
            <label className="study-filter-field">
              <span>Family</span>
              <select value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
                <option value="all">All families</option>
                {families.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {visiblePlants.length === 0 && (
          <p style={{ opacity: 0.7 }}>No plants match these filters.</p>
        )}

        {visiblePlants.map((plant) => (
          <div key={plant.id} className="study-card">
            <div className="study-card-top">
              <img src={plant.photo_urls[0]} alt="" className="study-card-photo" />
              <div className="study-card-heading">
                <div className="study-card-week">Week {plant.week_added}</div>
                <div className="study-card-name">{plant.botanical_name || 'Untitled'}</div>
                <div className="study-card-common">{plant.common_name}</div>
              </div>
            </div>
            <div className="study-card-details">
              {DETAIL_FIELDS.map((field) => (
                <div key={field}>
                  {FIELD_LABELS[field]}: {plant[field]}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
