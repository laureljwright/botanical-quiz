import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PhotoCarousel } from '../components/PhotoCarousel'
import { ProgressHeader } from '../components/ProgressHeader'
import { QuizAnswerField, type FieldStatus } from '../components/QuizAnswerField'
import { TabBar } from '../components/TabBar'
import { isCorrectAnswer } from '../lib/match'
import { fetchPlantsWithStats, recordQuizResult } from '../lib/plants'
import { pickNextPlant } from '../lib/quizSelection'
import { FIELD_LABELS, PLANT_FIELDS } from '../lib/types'
import type { PlantField, PlantWithStats } from '../lib/types'

const RECENT_HISTORY = 4

type Answers = Record<PlantField, string>
type Statuses = Record<PlantField, FieldStatus>

function emptyAnswers(): Answers {
  return Object.fromEntries(PLANT_FIELDS.map((f) => [f, ''])) as Answers
}

function emptyStatuses(): Statuses {
  return Object.fromEntries(PLANT_FIELDS.map((f) => [f, 'idle'])) as Statuses
}

export function Quiz() {
  const [plants, setPlants] = useState<PlantWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [current, setCurrent] = useState<PlantWithStats | null>(null)
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [answers, setAnswers] = useState<Answers>(emptyAnswers())
  const [statuses, setStatuses] = useState<Statuses>(emptyStatuses())
  const [graded, setGraded] = useState(false)
  const [roundCorrect, setRoundCorrect] = useState(false)

  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPlantsWithStats()
        setPlants(data)
        setCurrent(pickNextPlant(data, []))
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currentWeek = useMemo(
    () => (plants.length ? Math.max(...plants.map((p) => p.week_added)) : 1),
    [plants],
  )

  function handleSubmit() {
    if (!current) return
    const nextStatuses = emptyStatuses()
    let allCorrect = true
    for (const field of PLANT_FIELDS) {
      const ok = isCorrectAnswer(answers[field], current[field])
      nextStatuses[field] = ok ? 'correct' : 'incorrect'
      if (!ok) allCorrect = false
    }
    setStatuses(nextStatuses)
    setGraded(true)
    setRoundCorrect(allCorrect)
    setSessionTotal((t) => t + 1)
    setSessionCorrect((c) => c + (allCorrect ? 1 : 0))
    setStreak((s) => (allCorrect ? s + 1 : 0))
    recordQuizResult(current.id, allCorrect).catch(() => {
      /* stats update failing shouldn't block studying */
    })
  }

  function handleReset() {
    setAnswers(emptyAnswers())
    setStatuses(emptyStatuses())
  }

  function handleNext() {
    if (!current) return
    const nextRecent = [current.id, ...recentIds].slice(0, RECENT_HISTORY)
    setRecentIds(nextRecent)
    setCurrent(pickNextPlant(plants, nextRecent))
    setAnswers(emptyAnswers())
    setStatuses(emptyStatuses())
    setGraded(false)
    setRoundCorrect(false)
  }

  if (loading) return <div className="page-dark screen-content">Loading…</div>
  if (error)
    return (
      <div className="page-dark screen-content">
        <div className="error-text">{error}</div>
      </div>
    )

  if (!current) {
    return (
      <div className="page-dark">
        <TabBar active="quiz" />
        <div className="screen-content">
          <p>No plants yet — add some first before quizzing yourself.</p>
          <Link to="/plants/new" className="btn-pill btn-pill-mint" style={{ textAlign: 'center' }}>
            + Add New Plants
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-dark">
      <TabBar active="quiz" />
      <div className="screen-content">
        <ProgressHeader
          week={currentWeek}
          correct={sessionCorrect}
          total={sessionTotal}
          streak={streak}
        />

        <PhotoCarousel photos={current.photo_urls} alt="Identify this plant" />

        {PLANT_FIELDS.map((field) => (
          <QuizAnswerField
            key={field}
            label={FIELD_LABELS[field]}
            value={answers[field]}
            onChange={(value) => setAnswers((a) => ({ ...a, [field]: value }))}
            status={statuses[field]}
            correctValue={current[field]}
            disabled={graded}
            pronounceText={
              graded && (field === 'botanical_name' || field === 'family_name')
                ? current[field]
                : undefined
            }
          />
        ))}

        {graded && roundCorrect && current.fun_fact && (
          <div className="fun-fact">🌱 {current.fun_fact}</div>
        )}

        {!graded ? (
          <div className="pill-row">
            <button type="button" className="btn-pill btn-pill-outline-mint" onClick={handleReset}>
              Reset
            </button>
            <button type="button" className="btn-pill btn-pill-mint" onClick={handleSubmit}>
              Next
            </button>
          </div>
        ) : (
          <div className="pill-row">
            <button type="button" className="btn-pill btn-pill-mint" onClick={handleNext}>
              Next Plant
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
