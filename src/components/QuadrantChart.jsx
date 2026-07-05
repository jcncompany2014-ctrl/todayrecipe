import { QUADRANTS } from '../lib/calc'

/* 인기(판매량) × 마진 사분면 스캐터 차트 — 메뉴 엔지니어링.
   data = menuMatrix(...) 결과. numbered면 기여도 순번을 점 안에 표시. */
export const QCOL = { star: '#16A06A', puzzle: '#3E9BD1', plow: '#D69412', dog: '#D04B3F' }

export default function QuadrantChart({ data, height = 250, numbered = false }) {
  const { rows, avgMargin, avgPop, maxPop, maxMargin } = data
  const W = 300, H = height, PL = 26, PR = 14, PT = 16, PB = 24
  const plotW = W - PL - PR, plotH = H - PT - PB
  const xMax = maxPop * 1.16, yMax = maxMargin * 1.16
  const X = (p) => PL + (p / xMax) * plotW
  const Y = (m) => PT + (1 - m / yMax) * plotH
  const ax = X(avgPop), ay = Y(avgMargin)
  const zones = [
    { q: 'puzzle', x: PL, y: PT, w: ax - PL, h: ay - PT, ax: 'start', ay: PT + 12 },
    { q: 'star', x: ax, y: PT, w: (W - PR) - ax, h: ay - PT, ax: 'end', ay: PT + 12 },
    { q: 'dog', x: PL, y: ay, w: ax - PL, h: (PT + plotH) - ay, ax: 'start', ay: PT + plotH - 6 },
    { q: 'plow', x: ax, y: ay, w: (W - PR) - ax, h: (PT + plotH) - ay, ax: 'end', ay: PT + plotH - 6 },
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="qchart" width="100%" role="img" aria-label="메뉴 인기 대 마진 사분면">
      {zones.map((z) => <rect key={z.q} x={z.x} y={z.y} width={Math.max(0, z.w)} height={Math.max(0, z.h)} fill={QCOL[z.q]} opacity="0.06" />)}
      <line x1={ax} y1={PT} x2={ax} y2={PT + plotH} className="qdiv" />
      <line x1={PL} y1={ay} x2={W - PR} y2={ay} className="qdiv" />
      {zones.map((z) => (
        <text key={z.q + 'l'} x={z.ax === 'end' ? z.x + z.w - 5 : z.x + 5} y={z.ay} textAnchor={z.ax} className="qz-lab" fill={QCOL[z.q]}>{QUADRANTS[z.q].nm}</text>
      ))}
      <line x1={PL} y1={PT} x2={PL} y2={PT + plotH} className="qaxis" />
      <line x1={PL} y1={PT + plotH} x2={W - PR} y2={PT + plotH} className="qaxis" />
      {rows.map((r, i) => (
        <g key={r.m.id}>
          <circle cx={X(r.pop)} cy={Y(r.margin)} r={numbered ? 9 : 5} fill={QCOL[r.q]} stroke="#fff" strokeWidth={numbered ? 1.6 : 1} />
          {numbered && <text x={X(r.pop)} y={Y(r.margin) + 3.4} textAnchor="middle" className="qdot-n" fill="#fff">{i + 1}</text>}
        </g>
      ))}
      <text x={PL - 2} y={PT - 5} className="qcap">마진↑</text>
      <text x={W - PR} y={H - 5} textAnchor="end" className="qcap">많이 팔림 →</text>
    </svg>
  )
}
