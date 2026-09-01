export function ProgressHeader({
  week,
  correct,
  total,
  streak,
}: {
  week: number
  correct: number
  total: number
  streak: number
}) {
  return (
    <div className="week-header-block">
      <div className="week-header">
        Week {week} | {correct}/{total}
      </div>
      {streak > 0 && <div className="streak-line">🔥 {streak} in a row</div>}
    </div>
  )
}
