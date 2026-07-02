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

// 목표 역산: 하루 목표 순이익(goal)까지 벌려면 몇 그릇? = ceil( (고정비 + 목표) ÷ 그릇당 남는 돈 )
export function bowlsForGoal(profit, goal = 0, dailyFixed = DAILY_FIXED) {
  if (profit <= 0) return Infinity
  return Math.ceil((dailyFixed + Math.max(0, goal)) / profit)
}
// {be:본전그릇, total:목표달성그릇, extra:목표분(=total-be)}
export function goalPlan(profit, goal = 0, dailyFixed = DAILY_FIXED) {
  const be = bowlsForGoal(profit, 0, dailyFixed)
  const total = bowlsForGoal(profit, goal, dailyFixed)
  return { be, total, extra: total === Infinity ? Infinity : Math.max(0, total - be) }
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

/* ────────────────────────────────────────────────────────────
   기능 확장(2026-07-02): 원가 구성 · 재료 대체 · 마진 진단
   전부 앱 내부 데이터로 완결 — 외부 연동 없음.
   ──────────────────────────────────────────────────────────── */

// 한글 조사 (받침 유무로 을/를·은/는·이/가)
const hasBatchim = (w) => {
  if (!w) return false
  const c = w.charCodeAt(w.length - 1)
  return c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 !== 0 : false
}
export const eul = (w) => w + (hasBatchim(w) ? '을' : '를')
export const eun = (w) => w + (hasBatchim(w) ? '은' : '는')

// 원가 구성 세그먼트 (도넛/스택바용): 재료별 실원가 + 부대비용 파트
export function costSegments(items, price, opts = {}) {
  const ing = items
    .map((it) => {
      const p = PRODUCTS[it.id]
      return p ? { key: it.id, label: p.nm, v: costOf(it), type: 'ing', cat: p.cat } : null
    })
    .filter((x) => x && x.v > 0)
  const ovh = overheadBreakdown(price, opts)
    .map((r, i) => ({ key: 'ovh' + i, label: r.k, v: r.v, type: 'ovh' }))
    .filter((x) => x.v > 0)
  const segments = [...ing, ...ovh]
  const total = segments.reduce((a, x) => a + x.v, 0)
  return { segments, ingTotal: ing.reduce((a, x) => a + x.v, 0), ovhTotal: ovh.reduce((a, x) => a + x.v, 0), total }
}

// 재료 대체: 같은 카테고리의 더 싼(=마진 개선) 대안. 재료당 최선안만, 마진 개선순.
// (이미 담긴 재료는 제외 — 중복/이상한 제안 방지) 사용량·조리법은 유지, 원가 비교만(맛은 사장님 판단).
export function bestSubstitutions(items, price, opts = {}) {
  const base = summarize(items, price, opts)
  const owned = new Set(items.map((it) => it.id))
  const perFrom = {}
  items.forEach((it) => {
    const p = PRODUCTS[it.id]
    if (!p) return
    Object.keys(PRODUCTS).forEach((cid) => {
      if (cid === it.id || owned.has(cid)) return
      const c = PRODUCTS[cid]
      if (c.cat !== p.cat) return
      const method = c.cookable ? it.method : '생'
      const swapped = items.map((x) => (x.id === it.id ? { id: cid, grams: it.grams, method } : x))
      const s = summarize(swapped, price, opts)
      const marginDelta = s.margin - base.margin
      if (marginDelta <= 0) return
      const costDelta = s.food - base.food // 음수 = 절감
      const cur = perFrom[it.id]
      if (!cur || marginDelta > cur.marginDelta) {
        perFrom[it.id] = { fromId: it.id, fromNm: p.nm, fromCat: p.cat, toId: cid, toNm: c.nm, method, marginDelta, costDelta, newMargin: s.margin }
      }
    })
  })
  return Object.values(perFrom).sort((a, b) => b.marginDelta - a.marginDelta)
}

// 마진 진단(규칙 기반): 가장 약한 지점 판정 + 개선책 2~3개(예상 효과 수치 포함)
export function diagnose(build, opts = {}, dailyFixed = DAILY_FIXED) {
  const items = build.items || []
  const price = build.price || 0
  const s = summarize(items, price, opts)
  const { food, profit, margin } = s
  const rate = opts.rate ?? DELIVERY_RATE
  const level = sig(margin)

  const V = {
    g: { title: '마진이 건강해요', line: '이 가격, 자신 있게 받으셔도 돼요.', label: '마진을 더 높이고 싶다면' },
    w: { title: '마진이 아슬아슬해요', line: '조금만 손보면 안전권(30%)으로 올라가요.', label: '이렇게 하면 좋아져요' },
    b: { title: '마진이 빠듯해요', line: '지금 구조로는 팔수록 남는 게 적어요.', label: '이렇게 하면 좋아져요' },
  }[level]

  const fixedCost = food + fixedOverheadFor(opts)
  const targetPrice = (tm) => {
    const denom = 1 - rate - tm / 100
    return denom > 0 ? Math.ceil(fixedCost / denom / 100) * 100 : null
  }

  const actions = []

  // 1) 판매가 조정 (현재 목표 미달일 때만)
  const tm = margin < 30 ? 30 : 35
  const tp = targetPrice(tm)
  if (tp && tp > price) actions.push({ kind: 'price', icon: 'money', label: `판매가를 ${won(tp)}원으로 올리면`, effect: `마진 ${tm}%`, delta: tm - margin })

  // 2) 재료 대체 (최선안)
  const subs = bestSubstitutions(items, price, opts)
  if (subs[0]) {
    const b = subs[0]
    actions.push({ kind: 'sub', icon: 'swap', label: `${b.fromNm} 대신 ${eul(b.toNm)} 쓰면`, effect: `마진 +${b.marginDelta}%p`, delta: b.marginDelta })
  }

  // 3) 사용량 줄이기 (가장 비싼 재료 20%↓)
  if (items.length) {
    const pricey = items.map((it) => ({ it, c: costOf(it) })).sort((a, b) => b.c - a.c)[0]
    if (pricey && pricey.it.grams > 20) {
      const g2 = Math.round((pricey.it.grams * 0.8) / 10) * 10
      const reduced = items.map((x) => (x.id === pricey.it.id ? { ...x, grams: g2 } : x))
      const d = summarize(reduced, price, opts).margin - margin
      if (d >= 1) actions.push({ kind: 'grams', icon: 'scale', label: `${PRODUCTS[pricey.it.id].nm} 사용량을 20% 줄이면`, effect: `마진 +${d}%p`, delta: d })
    }
  }

  // 4) 부대비용 (배달 수수료 비중 큼)
  const fee = deliveryFeeFor(price, opts)
  if (profit > 0 && fee >= profit * 0.25) {
    actions.push({ kind: 'fee', icon: 'store', label: '포장·매장·자사몰 주문을 늘리면', effect: `수수료 ${won(fee)}원 절약`, delta: 0 })
  }

  const ranked = actions.sort((a, b) => b.delta - a.delta).slice(0, 3)
  return { level, title: V.title, line: V.line, actionsLabel: V.label, margin, actions: ranked }
}
