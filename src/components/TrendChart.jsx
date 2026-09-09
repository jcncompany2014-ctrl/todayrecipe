import { AreaChart } from '../charts/area-chart'
import { Area } from '../charts/area'
import { Grid } from '../charts/grid'
import { XAxis } from '../charts/x-axis'
import { won } from '../lib/calc'

/* 최근 7일 순이익 추이 — 계산기를 감시자로 만드는 화면.
   판매 기록(salesLog)에 날짜가 생기면서 비로소 그릴 수 있게 됐다.
   차트는 대시보드에서만 불러온다(대시보드가 lazy라 첫 로드에 안 실린다). */
export default function TrendChart({ days, menus, dailyFixed }) {
  const priceOf = {}
  menus.forEach((m) => { priceOf[m.id] = { price: m.price, margin: m.margin } })

  const data = days.map((d) => {
    const gross = Object.entries(d.sold).reduce((a, [id, n]) => {
      const m = priceOf[id]
      return a + (m ? Math.round((m.price * m.margin) / 100) * n : 0)
    }, 0)
    const [y, mo, dd] = d.key.split('-').map(Number)
    return { date: new Date(y, mo - 1, dd), net: gross - dailyFixed, bowls: d.count }
  })

  const hasAny = data.some((d) => d.bowls > 0)
  const last = data[data.length - 1]
  const best = data.reduce((a, b) => (b.net > a.net ? b : a), data[0])

  if (!hasAny) {
    return (
      <div className="trend-empty">
        <b>아직 기록이 없어요</b>
        <span>‘오늘 장사 마감’에서 판 개수를 넣으면<br />날마다 얼마 남았는지 여기에 쌓여요</span>
      </div>
    )
  }

  return (
    <>
      <div className="trend-top">
        <div>
          <span className="tt-lab">오늘 순이익</span>
          <b className={`tt-net num ${last.net >= 0 ? 'pos' : 'neg'}`}>
            {last.net >= 0 ? '+' : '−'}₩{won(Math.abs(last.net))}
          </b>
        </div>
        <span className="tt-best num">최고 {best.net >= 0 ? '+' : '−'}₩{won(Math.abs(best.net))}</span>
      </div>
      <div className="trend-chart">
        <AreaChart data={data} xDataKey="date" aspectRatio="16 / 9">
          <Grid />
          <XAxis />
          <Area
            dataKey="net"
            stroke="var(--good-1)"
            fill="var(--good-1)"
            strokeWidth={2}
            fillOpacity={0.14}
          />
        </AreaChart>
      </div>
    </>
  )
}
