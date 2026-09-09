import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PhotoCarousel } from '../components/PhotoCarousel'
import { ProgressHeader } from '../components/ProgressHeader'
import { QuizAnswerField, type FieldStatus } from '../components/QuizAnswerField'
import { TabBar } from '../components/TabBar'
import { isCorrectAnswer } from '../lib/match'
import { fetchPlantsWithStats, recordQuizResult } from '../lib/plants'
import { pickNextPlant } from '../lib/quizSelection'
import { FIELD_LABELS, FIELD_POINTS, PLANT_FIELDS, TOTAL_QUIZ_POINTS } from '../lib/types'
import type { PlantField, PlantWithStats } from '../lib/types'

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
  const [remainingIds, setRemainingIds] = useState<string[]>([])
  const [answers, setAnswers] = useState<Answers>(emptyAnswers())
  const [statuses, setStatuses] = useState<Statuses>(emptyStatuses())
  const [graded, setGraded] = useState(false)
  const [roundScore, setRoundScore] = useState<number | null>(null)
  const [showTip, setShowTip] = useState(false)

  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPlantsWithStats()
        setPlants(data)
        const pick = pickNextPlant(data, [])
        if (pick) {
          setCurrent(pick.plant)
          setRemainingIds(pick.remainingIds)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleSubmit() {
    if (!current) return
    const nextStatuses = emptyStatuses()
    let allCorrect = true
    let points = 0
    for (const field of PLANT_FIELDS) {
      const ok = isCorrectAnswer(answers[field], current[field])
      nextStatuses[field] = ok ? 'correct' : 'incorrect'
      if (ok) points += FIELD_POINTS[field]
      else allCorrect = false
    }
    setStatuses(nextStatuses)
    setGraded(true)
    setRoundScore(points)
    setSessionTotal((t) => t + 1)
    setSessionCorrect((c) => c + (allCorrect ? 1 : 0))
    setStreak((s) => (allCorrect ? s + 1 : 0))
    recordQuizResult(current.id, allCorrect).catch(() => {
      /* stats update failing shouldn't block studying */
    })
  }

  function handleNext() {
    if (!current) return
    const pick = pickNextPlant(plants, remainingIds)
    if (pick) {
      setCurrent(pick.plant)
      setRemainingIds(pick.remainingIds)
    }
    setAnswers(emptyAnswers())
    setStatuses(emptyStatuses())
    setGraded(false)
    setRoundScore(null)
    setShowTip(false)
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
          week={current.week_added}
          correct={sessionCorrect}
          total={sessionTotal}
          streak={streak}
        />

        <PhotoCarousel photos={current.photo_urls} alt="Identify this plant" />

        {current.fun_fact && (
          <>
            <button
              type="button"
              className="tip-toggle"
              onClick={() => setShowTip((s) => !s)}
            >
              💡 {showTip ? 'Hide tip' : 'Show tip'}
            </button>
            {showTip && <div className="fun-fact">🌱 {current.fun_fact}</div>}
          </>
        )}

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

        {graded && roundScore !== null && (
          <div className="round-score">
            Score: {roundScore}/{TOTAL_QUIZ_POINTS}
          </div>
        )}

        {!graded ? (
          <div className="pill-row">
            <button type="button" className="btn-pill btn-pill-outline-mint" onClick={handleNext}>
              Skip
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
