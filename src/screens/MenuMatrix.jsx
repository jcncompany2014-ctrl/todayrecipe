import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import QuadrantChart, { QCOL } from '../components/QuadrantChart'
import { useStore } from '../state/store'
import { won, menuMatrix, QUADRANTS, QUAD_ORDER } from '../lib/calc'

/* 메뉴 엔지니어링 — 인기(판매량) × 마진 사분면으로 올릴 메뉴·손볼 메뉴를 짚어준다. */
export default function MenuMatrix() {
  const nav = useNavigate()
  const { menus, soldToday } = useStore()
  const soldCount = Object.values(soldToday).reduce((a, n) => a + n, 0)
  const useReal = soldCount > 0
  const popOf = (m) => (useReal ? (soldToday[m.id] || 0) : (m.pop || 0))

  const data = menuMatrix(menus, popOf)
  const rows = data.rows.map((r, i) => ({ ...r, n: i + 1 }))
  const best = rows[0]

  return (
    <div className="scroll">
      <div className="hd fade">
        <div className="hd-top">
          <button className="iconbtn" aria-label="뒤로" onClick={() => nav('/app/dashboard')}><Icon name="back" size={22} stroke={2} /></button>
          <h1>메뉴 엔지니어링</h1>
        </div>
        <p className="sub">잘 팔리는 메뉴가 꼭 잘 남는 건 아니에요. 인기와 마진을 같이 봐야 진짜가 보여요.</p>
      </div>

      <div className="mx-chartcard fade">
        <div className="mx-src">
          <span className={`mx-srcdot${useReal ? ' live' : ''}`} />
          {useReal ? <>오늘 마감 판매량 <b>{soldCount}그릇</b> 기준</> : <>예상 판매량 기준 · <b>오늘 마감</b>을 넣으면 실제로 분석해요</>}
        </div>
        <QuadrantChart data={data} height={252} numbered />
        <div className="mx-axisnote">가로 = 얼마나 팔리나 · 세로 = 얼마나 남나 · 점선 = 가게 평균(마진 {data.avgMargin}% · {data.avgPop}그릇)</div>
      </div>

      {best && (
        <div className="mx-headline fade">
          이번 분석의 핵심은 <b style={{ color: QCOL[best.q] }}>{best.m.nm}</b> — 하루 이익 기여 <b className="num">{won(best.contrib)}원</b>으로 1위예요.
        </div>
      )}

      {QUAD_ORDER.map((q) => {
        const list = rows.filter((r) => r.q === q)
        if (!list.length) return null
        const Q = QUADRANTS[q]
        return (
          <div key={q} className="mx-quad fade">
            <div className="mx-qhead">
              <span className="mx-qbadge" style={{ background: QCOL[q] }}>{Q.nm}</span>
              <span className="mx-qshort" style={{ color: QCOL[q] }}>{Q.short}</span>
              <span className="mx-qcount num">{list.length}</span>
            </div>
            <p className="mx-qtip">{Q.tip}</p>
            <div className="mx-mlist">
              {list.map((r) => (
                <div className="mx-mrow" key={r.m.id}>
                  <span className="mx-n" style={{ background: QCOL[q] }}>{r.n}</span>
                  <div className="mx-photo"><Photo src={r.m.img} icon={r.m.icon} iconSize={19} alt={r.m.nm} /></div>
                  <div className="mx-mid">
                    <b>{r.m.nm}</b>
                    <span className="num">마진 {r.margin}% · 하루 {r.pop}그릇 · 그릇당 +{won(r.profitEach)}원</span>
                  </div>
                  <div className="mx-contrib num">{won(r.contrib)}<i>원</i></div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div className="mx-foot fade">숫자는 <b>하루 이익 기여(그릇당 남는 돈 × 판매량)</b>예요. 스타는 지키고, 일꾼은 마진을, 숨은 보석은 노출을 손보면 같은 손님으로 더 남아요.</div>
    </div>
  )
}
