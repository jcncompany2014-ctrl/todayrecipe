/* 계산 로직 — 사양 §5. 차별화의 심장 = 조리 수율(yield) 반영.
   부대비용 = 고정분(포장·인건비·가스) + 배달수수료(판매가 정률). 가격이 오르면 수수료도 오름. */
import { PRODUCTS } from '../data/catalog'

// 조리법별 수율(%)
export const YIELD = { 생: 100, 볶기: 80, 삶기: 90, 튀김: 75 }
export const COOKS = ['생', '볶기', '삶기', '튀김']

// 부대비용
export const DELIVERY_RATE = 0.12          // 배달앱 수수료 (판매가 정률)
export const FIXED_OVERHEAD = 1670          // 포장 300 + 조리 인건비 880 + 가스·부자재 490
export const PACKAGING = 300
export const LABOR = 880
export const GAS = 490
// 하루 고정비 기본값(데모) — 기본 제육덮밥에서 손익분기 66그릇이 나오는 값
export const DAILY_FIXED = 243000

export const won = (n) => Math.round(n).toLocaleString('ko-KR')
export const round10 = (n) => Math.round(n / 10) * 10

// 신호등: ≥30 초록 / 20~29 앰버 / <20 빨강
export const sig = (m) => (m >= 30 ? 'g' : m >= 20 ? 'w' : 'b')

// 배달수수료 / 부대비용 (판매가 연동)
export const deliveryFeeFor = (price) => Math.round(price * DELIVERY_RATE)
export const overheadFor = (price) => FIXED_OVERHEAD + deliveryFeeFor(price)
export const overheadBreakdown = (price) => [
  { k: `배달앱 수수료 (${Math.round(DELIVERY_RATE * 100)}%)`, v: deliveryFeeFor(price) },
  { k: '포장비', v: PACKAGING },
  { k: '조리 인건비', v: LABOR },
  { k: '가스·부자재', v: GAS },
]

// 항목 수율(조리 안 하는 재료는 100% 고정)
export function yieldOf(item) {
  const p = PRODUCTS[item.id]
  return p && p.cookable ? YIELD[item.method] : 100
}

// 재료별 실투입원가 = round( perG × 사용량g ÷ (수율/100) )
export function costOf(item) {
  const p = PRODUCTS[item.id]
  if (!p) return 0
  return Math.round((p.perG * item.grams) / (yieldOf(item) / 100))
}

// 장바구니 → 마진 요약 (부대비용은 판매가 연동)
export function summarize(items, price) {
  const food = items.reduce((a, it) => a + costOf(it), 0)
  const overhead = overheadFor(price)
  const cost = food + overhead
  const profit = price - cost
  const margin = price > 0 ? Math.round((profit / price) * 100) : 0
  return { food, overhead, cost, profit, margin, sig: sig(margin) }
}

// 손익분기 그릇 수 = ceil( 하루 고정비 ÷ 그릇당 남는 돈 ) — 본전은 정의상 올림
export function breakeven(profit, dailyFixed = DAILY_FIXED) {
  if (profit <= 0) return Infinity
  return Math.ceil(dailyFixed / profit)
}
