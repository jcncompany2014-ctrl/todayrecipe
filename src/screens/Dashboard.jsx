import Icon from '../components/Icon'
import GoalGauge from '../components/GoalGauge'
import { useStore } from '../state/store'
import { won, round10, breakeven, goalPlan } from '../lib/calc'

export default function Dashboard() {
  const { menus, dailyFixed, setDailyFixed, goal, setGoal } = useStore()

  const ranked = [...menus].sort((a, b) => b.margin - a.margin)
  const avgProfit = round10(menus.reduce((a, m) => a + (m.price * m.margin) / 100, 0) / menus.length)
  const shopBowls = breakeven(avgProfit, dailyFixed)
  const gp = goalPlan(avgProfit, goal, dailyFixed)   // 가게 전체 목표 역산

  const counts = { g: 0, w: 0, b: 0 }
  menus.forEach((m) => { counts[m.margin >= 30 ? 'g' : m.margin >= 20 ? 'w' : 'b']++ })
  const total = menus.length
  const pct = (n) => Math.round((n / total) * 100)
  const C = { g: '#16A06A', w: '#D69412', b: '#D04B3F' }
  const a1 = pct(counts.g), a2 = pct(counts.w)
  const donut = `conic-gradient(${C.g} 0 ${a1}%, ${C.w} ${a1}% ${a1 + a2}%, ${C.b} ${a1 + a2}% 100%)`

  return (
    <div className="scroll">
      <div className="hd fade">
        <h1 className="hd-title">대시보드</h1>
        <p className="hd-desc">가게 전체 마진을 한눈에</p>
      </div>

      <div className="be fade">
        <div className="lab">하루 고정비 ÷ 메뉴 평균 {won(avgProfit)}원 · 가게 전체 기준</div>
        <div className="big"><b className="num">{shopBowls === Infinity ? '—' : shopBowls}</b><span className="unit">그릇</span></div>
        <div className="field">
          <span className="k">하루 고정비</span>
          <div className="stepper2">
            <button aria-label="감소" onClick={() => setDailyFixed(Math.max(50000, dailyFixed - 10000))}><Icon name="minus" size={16} stroke={2.4} /></button>
            <span className="v num">{won(dailyFixed)}원</span>
            <button aria-label="증가" onClick={() => setDailyFixed(dailyFixed + 10000)}><Icon name="plus" size={16} stroke={2.4} /></button>
          </div>
        </div>
      </div>

      {/* 하루 목표 역산 (가게 전체) */}
      <div className="panel fade" style={{ animationDelay: '.03s' }}>
        <h2>하루 목표 벌이</h2>
        <div className="ph">이만큼 벌려면 가게 전체로 몇 그릇 팔면 될까요?</div>
        <div className="goal-top">
          <span className="gt-lab">하루에 벌고 싶은 돈</span>
          <span className="gt-val num">{won(goal)}원</span>
        </div>
        <input type="range" className="sim-range" min="0" max="300000" step="10000" value={Math.min(goal, 300000)}
          onChange={(e) => setGoal(Number(e.target.value))} aria-label="하루 목표 순이익" />
        <div className="goal-hero">
          가게 전체로 하루 <b className="num">{gp.total === Infinity ? '—' : gp.total}</b>그릇 팔면{' '}
          {goal > 0 ? <><b className="num">{won(goal)}원</b> 남아요</> : <>본전이에요</>}
        </div>
        <GoalGauge be={gp.be} total={gp.total} />
        <p className="sim-msg">본전 <b>{gp.be === Infinity ? '—' : `${gp.be}그릇`}</b>{goal > 0 && gp.total !== Infinity && <> + 목표분 <b className="g">{gp.extra}그릇</b></>} · 그릇당 평균 {won(avgProfit)}원 기준</p>
      </div>

      <div className="panel fade" style={{ animationDelay: '.05s' }}>
        <h2>메뉴 마진 순위</h2>
        <div className="ph">효자 메뉴부터 적자 메뉴까지</div>
        {ranked.map((m, i) => {
          const s = m.margin >= 30 ? 'g' : m.margin >= 20 ? 'w' : 'b'
          return (
            <div key={m.id} className="rankrow">
              <span className="rk">{i + 1}</span>
              <span className="nm">{m.nm}</span>
              <span className="track"><span className={`${s}-bg`} style={{ width: `${Math.max(3, Math.min(100, m.margin))}%` }} /></span>
              <span className={`pc num ${s}`}>{m.margin}%</span>
            </div>
          )
        })}
      </div>

      <div className="panel fade" style={{ animationDelay: '.1s' }}>
        <h2>마진 건강도</h2>
        <div className="ph">메뉴 {total}개 분포</div>
        <div className="donut-wrap">
          <div style={{ width: 108, height: 108, borderRadius: '50%', background: donut, flex: '0 0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <b style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.5px' }} className="num">{pct(counts.g)}%</b>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--muted)' }}>건강</span>
            </div>
          </div>
          <div className="legend">
            <div className="lg"><i style={{ background: C.g }} />건강 30% 이상<span className="num">{counts.g}개</span></div>
            <div className="lg"><i style={{ background: C.w }} />주의 20~29%<span className="num">{counts.w}개</span></div>
            <div className="lg"><i style={{ background: C.b }} />위험 20% 미만<span className="num">{counts.b}개</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
