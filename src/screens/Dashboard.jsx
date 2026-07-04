import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import GoalGauge from '../components/GoalGauge'
import { useStore } from '../state/store'
import { won, round10, breakeven, goalPlan, manwon } from '../lib/calc'

export default function Dashboard() {
  const nav = useNavigate()
  const { menus, monthlyFixed, monthlyGoal, workDays, setMonthlyFixed, setMonthlyGoal, setWorkDays, dailyFixed, dailyGoal, soldToday } = useStore()
  const soldCount = Object.values(soldToday).reduce((a, n) => a + n, 0)

  const ranked = [...menus].sort((a, b) => b.margin - a.margin)
  const avgProfit = round10(menus.reduce((a, m) => a + (m.price * m.margin) / 100, 0) / menus.length)
  const shopBowls = breakeven(avgProfit, dailyFixed)
  const gp = goalPlan(avgProfit, dailyGoal, dailyFixed)   // 가게 전체: 한 달 목표 → 하루치 역산

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

      <div className="dash-actions fade">
        <button className="dact" onClick={() => nav('/app/sales')}>
          <span className="dact-ic amber"><Icon name="receipt2" size={19} stroke={1.9} /></span>
          <span className="dact-txt"><b>오늘 장사 마감</b><em>{soldCount > 0 ? `${soldCount}그릇 판매 중` : '판매·정산 기록'}</em></span>
          <Icon name="chevR" size={17} stroke={2} />
        </button>
        <button className="dact" onClick={() => nav('/app/monthly')}>
          <span className="dact-ic green"><Icon name="doc" size={19} stroke={1.9} /></span>
          <span className="dact-txt"><b>이번 달 손익 요약</b><em>월 매출·순이익 계산</em></span>
          <Icon name="chevR" size={17} stroke={2} />
        </button>
      </div>

      <div className="be fade">
        <div className="lab">가게 전체 하루 본전 · 영업 {workDays}일 기준</div>
        <div className="big"><b className="num">{shopBowls === Infinity ? '—' : shopBowls}</b><span className="unit">그릇</span><span className="be-tail">팔면 본전</span></div>
        <div className="field">
          <span className="k">한 달 고정비</span>
          <div className="stepper2">
            <button aria-label="고정비 감소" onClick={() => setMonthlyFixed((v) => v - 100000)}><Icon name="minus" size={16} stroke={2.4} /></button>
            <span className="v num">{manwon(monthlyFixed)}</span>
            <button aria-label="고정비 증가" onClick={() => setMonthlyFixed((v) => v + 100000)}><Icon name="plus" size={16} stroke={2.4} /></button>
          </div>
        </div>
        <div className="field">
          <span className="k">한 달 영업일</span>
          <div className="stepper2">
            <button aria-label="영업일 감소" onClick={() => setWorkDays((d) => d - 1)}><Icon name="minus" size={16} stroke={2.4} /></button>
            <span className="v num">{workDays}일</span>
            <button aria-label="영업일 증가" onClick={() => setWorkDays((d) => d + 1)}><Icon name="plus" size={16} stroke={2.4} /></button>
          </div>
        </div>
        <div className="be-note">하루 고정비 {won(dailyFixed)}원 · 그릇당 평균 {won(avgProfit)}원</div>
      </div>

      {/* 목표 역산 (가게 전체) — 한 달 목표를 하루치로 */}
      <div className="panel fade" style={{ animationDelay: '.03s' }}>
        <h2>한 달 목표 벌이</h2>
        <div className="ph">이만큼 벌려면 가게 전체로 하루 몇 그릇 팔면 될까요?</div>
        <div className="goal-top">
          <span className="gt-lab">한 달에 벌고 싶은 돈</span>
          <span className="gt-val num">{manwon(monthlyGoal)}</span>
        </div>
        <input type="range" className="sim-range" min="0" max="6000000" step="100000" value={Math.min(monthlyGoal, 6000000)}
          onChange={(e) => setMonthlyGoal(Number(e.target.value))} aria-label="한 달 목표 순이익" />
        <div className="goal-hero">
          가게 전체로 하루 <b className="num">{gp.total === Infinity ? '—' : gp.total}</b>그릇 팔면{' '}
          {monthlyGoal > 0 ? <>한 달 <b className="num">{manwon(monthlyGoal)}</b> 벌어요</> : <>본전이에요</>}
        </div>
        <GoalGauge be={gp.be} total={gp.total} />
        <p className="sim-msg">본전 <b>{gp.be === Infinity ? '—' : `${gp.be}그릇`}</b>{monthlyGoal > 0 && gp.total !== Infinity && <> + 목표분 <b className="g">{gp.extra}그릇</b></>} · 하루로 치면 목표 {won(dailyGoal)}원</p>
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
