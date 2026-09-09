import { AreaChart } from '../charts/area-chart'
import { Area } from '../charts/area'
import { Grid } from '../charts/grid'
import { XAxis } from '../charts/x-axis'

/* BKLit 차트 시험 — 최근 2주 제육덮밥 마진 추이(가짜 데이터) */
const data = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(2026, 8, i + 1),
  margin: 38 + Math.round(Math.sin(i / 2.2) * 6) + Math.round(i * 0.4),
}))

export default function ChartTest() {
  return (
    <div className="scroll" style={{ padding: 20, background: '#fff' }}>
      <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>BKLit AreaChart 시험</h1>
      <p style={{ fontSize: 13, color: '#6B635A', marginBottom: 18 }}>
        최근 2주 제육덮밥 마진 추이 (가짜 데이터)
      </p>

      <div style={{ border: '1px solid #EDE9E3', borderRadius: 16, padding: 12 }}>
        <AreaChart data={data} xDataKey="date" aspectRatio="16 / 10">
          <Grid />
          <XAxis />
          <Area dataKey="margin" stroke="#16A06A" fill="#16A06A" strokeWidth={2} />
        </AreaChart>
      </div>

      <p style={{ fontSize: 12, color: '#6B635A', marginTop: 14, lineHeight: 1.6 }}>
        위가 BKLit 차트입니다. 아래는 지금 우리 앱이 쓰는 방식(순수 SVG)이에요.
      </p>

      <div style={{ border: '1px solid #EDE9E3', borderRadius: 16, padding: 12, marginTop: 12 }}>
        <svg viewBox="0 0 320 180" style={{ width: '100%', display: 'block' }}>
          <polyline
            fill="none" stroke="#16A06A" strokeWidth="2" strokeLinejoin="round"
            points={data.map((d, i) => `${20 + i * 21},${160 - (d.margin - 30) * 5}`).join(' ')}
          />
          <line x1="20" y1="160" x2="300" y2="160" stroke="#EDE9E3" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  )
}
