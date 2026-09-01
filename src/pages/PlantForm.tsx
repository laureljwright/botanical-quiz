import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PronounceButton } from '../components/PronounceButton'
import { TabBar } from '../components/TabBar'
import uploadIcon from '../assets/figma/upload-icon.svg'
import backArrow from '../assets/figma/back-arrow.svg'
import {
  createPlant,
  fetchPlant,
  getNextWeekNumber,
  updatePlant,
  uploadPlantPhoto,
} from '../lib/plants'
import { FIELD_LABELS, PLANT_FIELDS } from '../lib/types'
import type { NewPlant } from '../lib/types'

const emptyPlant: NewPlant = {
  botanical_name: '',
  common_name: '',
  type: '',
  origin: '',
  family_name: '',
  light: '',
  water: '',
  fun_fact: '',
  photo_urls: [],
  week_added: 1,
}

export function PlantForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [plant, setPlant] = useState<NewPlant>(emptyPlant)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    async function load() {
      if (id) {
        const existing = await fetchPlant(id)
        if (existing) setPlant(existing)
        setLoading(false)
      } else {
        const nextWeek = await getNextWeekNumber()
        setPlant((p) => ({ ...p, week_added: nextWeek }))
      }
    }
    load()
  }, [id])

  function setField<K extends keyof NewPlant>(key: K, value: NewPlant[K]) {
    setPlant((p) => ({ ...p, [key]: value }))
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    const remaining = 3 - plant.photo_urls.length
    const toUpload = Array.from(files).slice(0, Math.max(remaining, 0))
    if (toUpload.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const urls = await Promise.all(toUpload.map((file) => uploadPlantPhoto(file)))
      setPlant((p) => ({ ...p, photo_urls: [...p.photo_urls, ...urls] }))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUploading(false)
    }
  }

  function removePhoto(idx: number) {
    setPlant((p) => ({ ...p, photo_urls: p.photo_urls.filter((_, i) => i !== idx) }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (id) {
        await updatePlant(id, plant)
      } else {
        await createPlant(plant)
      }
      navigate('/plants')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page-light screen-content">Loading…</div>

  return (
    <div className="page-light">
      <TabBar active="plants" />
      <div className="screen-content">
        <Link to="/plants" className="back-link">
          <img src={backArrow} alt="" />
          BACK
        </Link>
        <div className="week-header-block">
          <div className="week-header">{isEdit ? 'Edit Plant' : 'Week added'}</div>
        </div>
        <hr className="divider" />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="field-row">
            <label className="uploader">
              <img src={uploadIcon} alt="" width={32} height={25} />
              <span className="uploader-label">{uploading ? 'Uploading…' : 'Upload Photos'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={plant.photo_urls.length >= 3}
                onChange={(e) => {
                  handleFilesSelected(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
            {plant.photo_urls.length > 0 && (
              <div className="uploader-thumbs">
                {plant.photo_urls.map((url, i) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    onClick={() => removePhoto(i)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            )}
          </div>

          {PLANT_FIELDS.map((fieldKey) => (
            <div className="field-row" key={fieldKey}>
              <label className="field-row-label" htmlFor={fieldKey}>
                {FIELD_LABELS[fieldKey]}
                {(fieldKey === 'botanical_name' || fieldKey === 'family_name') && (
                  <PronounceButton text={plant[fieldKey]} />
                )}
              </label>
              <input
                id={fieldKey}
                type="text"
                value={plant[fieldKey]}
                onChange={(e) => setField(fieldKey, e.target.value)}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>
          ))}

          <div className="field-row">
            <label className="field-row-label" htmlFor="fun_fact">
              Fun Fact (shown after a correct quiz answer)
            </label>
            <textarea
              id="fun_fact"
              rows={3}
              value={plant.fun_fact ?? ''}
              onChange={(e) => setField('fun_fact', e.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="field-row">
            <label className="field-row-label" htmlFor="week_added">
              Week Added
            </label>
            <input
              id="week_added"
              type="number"
              min={1}
              value={plant.week_added}
              onChange={(e) => setField('week_added', Number(e.target.value))}
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="pill-row">
            <button className="btn-pill btn-pill-dark" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
