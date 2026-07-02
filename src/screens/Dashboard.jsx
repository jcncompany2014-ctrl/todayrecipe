import { useState } from 'react'
import Icon from '../components/Icon'
import { useStore } from '../state/store'
import { won, round10, breakeven } from '../lib/calc'

export default function Dashboard() {
  const { menus, dailyFixed, setDailyFixed } = useStore()
  const [sold, setSold] = useState(60)

  const ranked = [...menus].sort((a, b) => b.margin - a.margin)
  const avgProfit = round10(menus.reduce((a, m) => a + (m.price * m.margin) / 100, 0) / menus.length)
  const shopBowls = breakeven(avgProfit, dailyFixed)

  // 오늘 장사 시뮬레이터
  const simMax = shopBowls === Infinity ? 200 : Math.ceil((shopBowls * 2) / 10) * 10
  const net = Math.round(sold * avgProfit - dailyFixed)
  const prog = shopBowls === Infinity ? 0 : Math.min(100, (sold / shopBowls) * 100)
  const left = shopBowls === Infinity ? null : Math.max(0, shopBowls - sold)

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

      {/* 오늘 장사 시뮬레이터 */}
      <div className="panel fade" style={{ animationDelay: '.03s' }}>
        <h2>오늘 장사 시뮬레이터</h2>
        <div className="ph">오늘 몇 그릇 팔았는지(팔 것 같은지) 밀어보세요</div>
        <div className="sim-top">
          <div className="sim-sold"><b className="num">{sold}</b><span>그릇</span></div>
          <div className={`sim-net num ${net >= 0 ? 'g' : 'b'}`}>{net >= 0 ? '+' : '−'}₩{won(Math.abs(net))}</div>
        </div>
        <input type="range" className="sim-range" min="0" max={simMax} step="1" value={Math.min(sold, simMax)}
          onChange={(e) => setSold(Number(e.target.value))} aria-label="오늘 판매량" />
        <div className="sim-bar"><span className={net >= 0 ? 'g-bg' : 'w-bg'} style={{ width: `${Math.max(2, prog)}%` }} />
          {shopBowls !== Infinity && <i className="sim-be" style={{ left: '50%' }} />}
        </div>
        <p className="sim-msg">
          {net >= 0
            ? <>본전 넘었어요! 지금부터 파는 건 전부 <b className="g">순이익</b>이에요</>
            : <>본전까지 <b>{left}그릇</b> 남았어요 · 그릇당 평균 {won(avgProfit)}원 기준</>}
        </p>
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
