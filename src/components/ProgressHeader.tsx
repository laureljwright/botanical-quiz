export function ProgressHeader({
  week,
  points,
  possiblePoints,
  streak,
}: {
  week: number
  points: number
  possiblePoints: number
  streak: number
}) {
  return (
    <div className="week-header-block">
      <div className="week-header">
        Week {week} | {points}/{possiblePoints}
      </div>
      {streak > 0 && <div className="streak-line">🔥 {streak} in a row</div>}
    </div>
  )
}
