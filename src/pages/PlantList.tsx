import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TabBar } from '../components/TabBar'
import trashIcon from '../assets/figma/trash-icon.svg'
import editIcon from '../assets/figma/edit-icon.svg'
import leafIcon from '../assets/figma/leaf-icon.svg'
import { deletePlant, fetchPlantsWithStats } from '../lib/plants'
import type { PlantWithStats } from '../lib/types'

export function PlantList() {
  const [plants, setPlants] = useState<PlantWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await fetchPlantsWithStats()
      setPlants(data.slice().reverse())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this plant?')) return
    await deletePlant(id)
    load()
  }

  return (
    <div className="page-light">
      <TabBar active="plants" />
      <div className="screen-content">
        <Link to="/plants/new" className="add-plant-btn">
          Add a Plant
          <img src={leafIcon} alt="" />
        </Link>

        {error && <div className="error-text">{error}</div>}
        {loading && <p>Loading…</p>}

        {!loading && plants.length === 0 && (
          <p style={{ opacity: 0.7 }}>No plants yet — tap "Add a Plant" to enter your first one.</p>
        )}

        {plants.map((plant) => (
          <div key={plant.id} className="plant-card">
            <Link
              to={`/plants/${plant.id}/edit`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}
            >
              <img src={plant.photo_urls[0]} alt="" className="plant-card-photo" />
              <div className="plant-card-info">
                <div className="plant-card-name">{plant.botanical_name || 'Untitled'}</div>
                <div className="plant-card-meta">{plant.common_name}</div>
                <div className="plant-card-meta">Week {plant.week_added}</div>
              </div>
            </Link>
            <div className="plant-card-actions">
              <Link to={`/plants/${plant.id}/edit`} className="plant-card-edit" aria-label="Edit plant">
                <img src={editIcon} alt="" />
              </Link>
              <button
                type="button"
                className="plant-card-trash"
                aria-label="Delete plant"
                onClick={() => handleDelete(plant.id)}
              >
                <img src={trashIcon} alt="" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
