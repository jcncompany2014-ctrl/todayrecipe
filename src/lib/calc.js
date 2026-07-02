/* 계산 로직 — 사양 §5. 차별화의 심장 = 조리 수율(yield) 반영.
   부대비용 = 고정분(포장·인건비·가스) + 배달수수료(판매가 정률).
   수수료율·포장비는 사장님이 직접 조절 가능(opts) — 가게 맞춤 계산. */
import { PRODUCTS } from '../data/catalog'

// 조리법별 수율(%)
export const YIELD = { 생: 100, 볶기: 80, 삶기: 90, 튀김: 75 }
export const COOKS = ['생', '볶기', '삶기', '튀김']

// 부대비용 기본값
export const DELIVERY_RATE = 0.12          // 배달앱 수수료 (판매가 정률)
export const PACKAGING = 300
export const LABOR = 880
export const GAS = 490
export const FIXED_OVERHEAD = PACKAGING + LABOR + GAS // 1,670 (기본값 기준)
// 하루 고정비 기본값(데모) — 기본 제육덮밥에서 손익분기 66그릇이 나오는 값
export const DAILY_FIXED = 243000

export const won = (n) => Math.round(n).toLocaleString('ko-KR')
export const round10 = (n) => Math.round(n / 10) * 10

// 신호등: ≥30 초록 / 20~29 앰버 / <20 빨강
export const sig = (m) => (m >= 30 ? 'g' : m >= 20 ? 'w' : 'b')

// 부대비용 (판매가·가게 설정 연동)
export const fixedOverheadFor = (opts = {}) => (opts.packaging ?? PACKAGING) + LABOR + GAS
export const deliveryFeeFor = (price, opts = {}) => Math.round(price * (opts.rate ?? DELIVERY_RATE))
export const overheadFor = (price, opts = {}) => fixedOverheadFor(opts) + deliveryFeeFor(price, opts)
export const overheadBreakdown = (price, opts = {}) => [
  { k: `배달앱 수수료 (${Math.round((opts.rate ?? DELIVERY_RATE) * 100)}%)`, v: deliveryFeeFor(price, opts) },
  { k: '포장비', v: opts.packaging ?? PACKAGING },
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

// 장바구니 → 마진 요약 (부대비용은 판매가·가게 설정 연동)
export function summarize(items, price, opts = {}) {
  const food = items.reduce((a, it) => a + costOf(it), 0)
  const overhead = overheadFor(price, opts)
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

// 식자재 원가가 pct% 변할 때의 마진 (스트레스 테스트)
export function marginWithFoodShift(food, price, pct, opts = {}) {
  const shifted = Math.round(food * (1 + pct / 100))
  const cost = shifted + overheadFor(price, opts)
  const profit = price - cost
  return price > 0 ? Math.round((profit / price) * 100) : 0
}

// 발주 계산: N그릇 팔 때 재료별 필요량(g)·구매비(원물가 기준, 수율 무관)
export function orderPlan(items, bowls) {
  const rows = items.map((it) => {
    const p = PRODUCTS[it.id]
    const grams = it.grams * bowls
    return { id: it.id, nm: p.nm, grams, buy: Math.round(p.perG * it.grams * bowls) }
  })
  const total = rows.reduce((a, r) => a + r.buy, 0)
  return { rows, total }
}

// g → 보기 좋은 단위 (1kg 이상은 kg)
export const fmtGrams = (g) => (g >= 1000 ? `${(g / 1000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}kg` : `${g}g`)
