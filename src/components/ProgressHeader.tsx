export function ProgressHeader({
  done,
  total,
  points,
  possiblePoints,
  streak,
}: {
  /** Plants worked through so far in the current set. */
  done: number
  /** Plants in the current set (after week / not-quizzed filters). */
  total: number
  points: number
  possiblePoints: number
  streak: number
}) {
  return (
    <div className="week-header-block">
      <div className="week-header">
        {done}/{total}
      </div>
      <div className="streak-line">
        {possiblePoints > 0 ? `${points}/${possiblePoints} pts` : '0 pts'}
        {streak > 0 && ` · 🔥 ${streak}`}
      </div>
    </div>
  )
}
