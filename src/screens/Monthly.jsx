import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useStore } from '../state/store'
import { won, manwon } from '../lib/calc'

/* 이번 달 손익 요약 — 메뉴별 '하루 평균 판매량'만 넣으면 한 달 매출·순이익을 역산. */
export default function Monthly() {
  const nav = useNavigate()
  const { menus, soldToday, monthlyFixed, monthlyGoal, workDays, dailyGoal } = useStore()
  // 오늘 마감에서 넣은 판매량이 있으면 하루 평균의 시작값으로 가져온다.
  const [daily, setDaily] = useState(() => ({ ...soldToday }))
  const seeded = Object.keys(soldToday).length > 0

  const setD = (id, v) => setDaily((s) => {
    const cur = s[id] || 0
    const next = typeof v === 'function' ? v(cur) : v
    return { ...s, [id]: Math.max(0, Math.round(next)) }
  })

  const rows = menus.map((m) => {
    const d = daily[m.id] || 0
    const qty = d * workDays
    const profitEach = Math.round((m.price * m.margin) / 100)
    return { m, d, qty, revenue: m.price * qty, profit: profitEach * qty }
  })
  const anyInput = rows.some((r) => r.d > 0)
  const revenue = rows.reduce((a, r) => a + r.revenue, 0)
  const grossProfit = rows.reduce((a, r) => a + r.profit, 0)
  const varCost = revenue - grossProfit
  const net = grossProfit - monthlyFixed
  const goalPct = monthlyGoal > 0 ? Math.round((net / monthlyGoal) * 100) : 0
  const topRows = [...rows].filter((r) => r.profit > 0).sort((a, b) => b.profit - a.profit)

  return (
    <div className="scroll">
      <div className="hd fade">
        <div className="hd-top">
          <button className="iconbtn" aria-label="뒤로" onClick={() => nav('/app/dashboard')}><Icon name="back" size={22} stroke={2} /></button>
          <h1>이번 달 손익 요약</h1>
        </div>
        <p className="sub">메뉴별 하루 평균 판매량으로 한 달 손익을 추정해요</p>
      </div>

      <div className="mo-sum fade">
        <div className="mo-lab">이번 달 예상 순이익 <span>(고정비 뺀)</span></div>
        <div className={`mo-net num ${net >= 0 ? 'pos' : 'neg'}`}>{net >= 0 ? '+' : '−'}{won(Math.abs(net))}<em>원</em></div>
        <div className="mo-grid">
          <div className="mo-cell"><span>매출</span><b className="num">{won(revenue)}</b></div>
          <div className="mo-cell"><span>재료·부대비</span><b className="num">{won(varCost)}</b></div>
          <div className="mo-cell"><span>한 달 고정비</span><b className="num">−{won(monthlyFixed)}</b></div>
        </div>
        {monthlyGoal > 0 && (
          <div className="mo-goal">
            <div className="mo-goal-top"><span>목표 {manwon(monthlyGoal)}까지</span><b className={`num ${net >= monthlyGoal ? 'g' : ''}`}>{Math.max(0, Math.min(999, goalPct))}%</b></div>
            <div className="mo-goal-bar"><span style={{ width: `${Math.max(2, Math.min(100, goalPct))}%` }} /></div>
            <div className="mo-goal-msg">
              {net >= monthlyGoal
                ? <>목표를 넘겼어요! 이대로면 한 달 <b className="g">{won(net - monthlyGoal)}원</b> 더 벌어요</>
                : net >= 0
                  ? <>목표까지 <b>{won(monthlyGoal - net)}원</b> 남았어요</>
                  : <>아직 고정비도 못 넘었어요 · <b className="b">{won(-net)}원</b> 적자</>}
            </div>
          </div>
        )}
      </div>

      <div className="menu-sec-head mo-head">
        <h2>하루 평균 판매량</h2>
        {seeded && <span className="mo-from">오늘 마감에서 불러옴</span>}
      </div>

      <div className="mo-list">
        {rows.map(({ m, d, profit }) => (
          <div className={`mo-row${d > 0 ? ' on' : ''}`} key={m.id}>
            <div className="mo-mid">
              <b>{m.nm}</b>
              <span className="num">{d > 0 ? <>한 달 <em>{d * workDays}그릇</em> · <em className="g">+{won(profit)}원</em></> : `${won(m.price)}원 · 마진 ${m.margin}%`}</span>
            </div>
            <div className="oe-stepper">
              <button aria-label="감소" onClick={() => setD(m.id, (c) => c - 1)}><Icon name="minus" size={14} stroke={2.4} /></button>
              <span className="v num">{d}</span>
              <button aria-label="증가" onClick={() => setD(m.id, (c) => c + 1)}><Icon name="plus" size={14} stroke={2.4} /></button>
            </div>
          </div>
        ))}
      </div>

      {anyInput && topRows.length > 0 && (
        <div className="panel fade mo-top">
          <h2>이번 달 효자 메뉴</h2>
          <div className="ph">한 달 이익에 가장 많이 보태는 순서</div>
          {topRows.slice(0, 5).map((r, i) => {
            const share = grossProfit > 0 ? Math.round((r.profit / grossProfit) * 100) : 0
            return (
              <div key={r.m.id} className="rankrow">
                <span className="rk">{i + 1}</span>
                <span className="nm">{r.m.nm}</span>
                <span className="track"><span className="g-bg" style={{ width: `${Math.max(3, share)}%` }} /></span>
                <span className="pc num g">{share}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
