import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import { useStore } from '../state/store'
import { won } from '../lib/calc'

/* 오늘 장사 마감 — 메뉴별 판매 개수만 넣으면 오늘 매출·원가·순이익 자동 정산. */
export default function SalesToday() {
  const nav = useNavigate()
  const { menus, soldToday, setSold, resetSold, dailyFixed, dailyGoal } = useStore()

  const rows = menus.map((m) => {
    const count = soldToday[m.id] || 0
    const profit = Math.round((m.price * m.margin) / 100) // 그릇당 남는 돈
    return { m, count, profit }
  })
  const totalCount = rows.reduce((a, r) => a + r.count, 0)
  const revenue = rows.reduce((a, r) => a + r.m.price * r.count, 0)
  const grossProfit = rows.reduce((a, r) => a + r.profit * r.count, 0) // 재료·부대비용 뺀 이익 합
  const net = grossProfit - dailyFixed // 하루 고정비까지 뺀 진짜 순이익
  const varCost = revenue - grossProfit
  const beDone = grossProfit >= dailyFixed
  const goalDone = dailyGoal > 0 && net >= dailyGoal

  const target = dailyFixed + Math.max(0, dailyGoal)
  const prog = target > 0 ? Math.min(100, (grossProfit / target) * 100) : 0
  const bePct = target > 0 ? Math.min(100, (dailyFixed / target) * 100) : 0

  return (
    <div className="scroll">
      <div className="hd fade">
        <div className="hd-top">
          <button className="iconbtn" aria-label="뒤로" onClick={() => nav('/app/dashboard')}><Icon name="back" size={22} stroke={2} /></button>
          <h1>오늘 장사 마감</h1>
        </div>
        <p className="sub">오늘 판 개수만 넣으면 순이익이 바로 정산돼요</p>
      </div>

      <div className="stl-sum fade">
        <div className="stl-lab">오늘 순이익 <span>(고정비까지 뺀)</span></div>
        <div className={`stl-net num ${net >= 0 ? 'pos' : 'neg'}`}>{net >= 0 ? '+' : '−'}₩{won(Math.abs(net))}</div>
        <div className="stl-break">
          <span>매출 <b className="num">{won(revenue)}</b></span>
          <span>재료·부대비 <b className="num">{won(varCost)}</b></span>
          <span>고정비 <b className="num">{won(dailyFixed)}</b></span>
        </div>
        <div className="stl-bar">
          <span className="stl-fill" style={{ width: `${Math.max(2, prog)}%` }} />
          <i className="stl-be" style={{ left: `${bePct}%` }} />
        </div>
        <div className="stl-scale"><span>0</span><span className="stl-be-lab" style={{ left: `${bePct}%` }}>본전</span><span>목표</span></div>
        <div className="stl-msg">
          {totalCount === 0
            ? <>아래에서 오늘 판 개수를 넣어보세요</>
            : goalDone
              ? <>오늘 목표까지 달성했어요! 수고하셨어요</>
              : beDone
                ? <>본전 넘었어요! 지금부터 파는 건 전부 <b className="g">순이익</b>이에요</>
                : <>본전까지 <b>{won(dailyFixed - grossProfit)}원</b> 남았어요</>}
        </div>
      </div>

      <div className="menu-sec-head stl-head">
        <h2>오늘 판 개수 <span className="stl-cnt num">{totalCount}그릇</span></h2>
        {totalCount > 0 && <button className="stl-reset" onClick={resetSold}>초기화</button>}
      </div>

      <div className="stl-list">
        {rows.map(({ m, count, profit }) => (
          <div className={`stl-row${count > 0 ? ' on' : ''}`} key={m.id}>
            <div className="stl-photo"><Photo src={m.img} icon={m.icon} iconSize={22} alt={m.nm} /></div>
            <div className="stl-mid">
              <b>{m.nm}</b>
              <span className="num">{won(m.price)}원 · 그릇당 <em className="g">+{won(profit)}원</em></span>
            </div>
            <div className="stl-line num">{count > 0 ? `+${won(profit * count)}` : ''}</div>
            <div className="oe-stepper stl-step">
              <button aria-label="감소" onClick={() => setSold(m.id, (c) => c - 1)}><Icon name="minus" size={14} stroke={2.4} /></button>
              <span className="v num">{count}</span>
              <button aria-label="증가" onClick={() => setSold(m.id, (c) => c + 1)}><Icon name="plus" size={14} stroke={2.4} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
