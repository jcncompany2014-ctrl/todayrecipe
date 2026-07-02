// 목표 역산 게이지 — 0 → 본전(be) → 목표(total). 앞은 가게 유지비, 그 뒤가 내 이익.
// 숫자는 양 끝(본전 왼쪽·목표 오른쪽)에 두어 라벨이 겹치지 않게.
export default function GoalGauge({ be, total }) {
  if (total === Infinity || be === Infinity) {
    return <div className="gg-inf">그릇당 남는 돈이 0 이하예요 · 판매가를 올리거나 원가를 낮춰 보세요</div>
  }
  const goalZone = total > be
  const raw = total > 0 ? (be / total) * 100 : 100
  const bePct = goalZone ? Math.max(10, Math.min(90, Math.round(raw))) : 100
  return (
    <div className="gg">
      <div className="gg-nums">
        <span className="gg-n muted"><b className="num">{be}</b>그릇<em>본전</em></span>
        {goalZone && <span className="gg-n good"><b className="num">{total}</b>그릇<em>목표</em></span>}
      </div>
      <div className="gg-bar">
        <span className="gg-fix" style={{ width: `${bePct}%` }} />
        {goalZone && <span className="gg-goal" style={{ width: `${100 - bePct}%` }} />}
        <i className="gg-div" style={{ left: `${bePct}%` }} />
      </div>
      <div className="gg-zones">
        <span className="muted">가게 유지비</span>
        {goalZone && <span className="good">여기부터 내 이익</span>}
      </div>
    </div>
  )
}
