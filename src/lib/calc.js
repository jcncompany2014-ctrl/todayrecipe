/* 계산 로직 — 사양 §5. 차별화의 심장 = 조리 수율(yield) 반영.
   부대비용 = 고정분(포장·인건비·가스) + 배달수수료(판매가 정률).
   수수료율·포장비는 사장님이 직접 조절 가능(opts) — 가게 맞춤 계산. */
import { PRODUCTS } from '../data/catalog'

/* ── 수율의 정의 (이 앱의 심장. 여기가 흔들리면 전부 흔들린다) ──
   레시피의 사용량(item.grams) = '조리 후' 접시에 올라가는 양 (EP, Edible Portion)
   원물 투입량(사야 하는 양)    = 사용량 ÷ (수율/100)          (AP, As Purchased)
   원가                        = 원물 단가 × 원물 투입량
   발주량                      = 원물 투입량 × 그릇 수
   → 원가와 발주가 '같은 투입량'에서 나오므로 서로 어긋날 수 없다.
   수율 100 초과 = 삶으면 불어나는 재료(밥·면·당면). 이때 투입량은 사용량보다 적다. */
export const YIELD = { 생: 100, 볶기: 80, 삶기: 90, 튀김: 75 }
export const COOKS = ['생', '볶기', '삶기', '튀김']

// 부대비용 기본값
export const DELIVERY_RATE = 0.12          // 배달앱 수수료 (판매가 정률)
/* 배달비는 정률만이 아니다 — 실제 배달앱은 '중개수수료(정률) + 배달비(정액)' 구조다.
   그리고 홀 손님에게는 아예 붙지 않는다. 그래서 채널 비중을 곱한다.
   기본값은 종전 동작과 동일(전부 배달·정액 0)로 두고, 사장님이 우리 가게 실제 비중을 넣게 한다. */
export const DELIVERY_FLAT = 0             // 건당 정액 배달비(원)
export const DELIVERY_SHARE = 1            // 매출 중 배달 주문 비중 (0~1)
export const PACKAGING = 300
export const LABOR = 880
export const GAS = 490
export const FIXED_OVERHEAD = PACKAGING + LABOR + GAS // 1,670 (기본값 기준)
// 하루 고정비 기본값(데모) — 기본 제육덮밥에서 손익분기 66그릇이 나오는 값
export const DAILY_FIXED = 243000

export const won = (n) => Math.round(n).toLocaleString('ko-KR')
export const round10 = (n) => Math.round(n / 10) * 10
/* 원/g 표시 — 소수점을 살린다. 양파 2.4원/g을 2원으로 뭉개면
   '내 매입가'를 넣는 의미 자체가 사라진다(그램 단가는 원래 잘다). */
export const perGText = (v) => {
  const n = Number(v) || 0
  return Number.isInteger(n) ? won(n) : String(Math.round(n * 100) / 100)
}
// 큰 금액은 '만원' 단위로 (한 달 고정비·목표 등)
export const manwon = (n) => `${won(Math.round(n / 10000))}만원`

// 신호등: ≥30 초록 / 20~29 앰버 / <20 빨강
export const sig = (m) => (m >= 30 ? 'g' : m >= 20 ? 'w' : 'b')

// 부대비용 (판매가·가게 설정 연동)
export const fixedOverheadFor = (opts = {}) => (opts.packaging ?? PACKAGING) + LABOR + GAS
export const deliveryFeeFor = (price, opts = {}) => {
  const rate = opts.rate ?? DELIVERY_RATE
  const flat = opts.flatFee ?? DELIVERY_FLAT
  const share = Math.min(1, Math.max(0, opts.deliveryShare ?? DELIVERY_SHARE))
  // 그릇당 평균 배달비용 = (정률 + 정액) × 배달 비중
  return Math.round((price * rate + flat) * share)
}
export const overheadFor = (price, opts = {}) => fixedOverheadFor(opts) + deliveryFeeFor(price, opts)
export const overheadBreakdown = (price, opts = {}) => {
  const share = Math.min(1, Math.max(0, opts.deliveryShare ?? DELIVERY_SHARE))
  const flat = opts.flatFee ?? DELIVERY_FLAT
  const ratePct = Math.round((opts.rate ?? DELIVERY_RATE) * 100)
  const label = share >= 1
    ? `배달앱 수수료 (${ratePct}%${flat ? ` + ${won(flat)}원` : ''})`
    : `배달 비용 (${ratePct}%${flat ? ` + ${won(flat)}원` : ''} × 배달 ${Math.round(share * 100)}%)`
  return [
  { k: label, v: deliveryFeeFor(price, opts) },
  { k: '포장비', v: opts.packaging ?? PACKAGING },
  { k: '조리 인건비', v: LABOR },
  { k: '가스·부자재', v: GAS },
  ]
}

// 항목 수율(조리 안 하는 재료는 100% 고정)
export function yieldOf(item) {
  const p = PRODUCTS[item.id]
  if (!p || !p.cookable) return 100
  // 재료마다 조리법별 실제 수율이 다르다(당면은 삶으면 불어난다). 있으면 그 값이 우선.
  const own = p.yieldBy && p.yieldBy[item.method]
  const y = own != null ? own : YIELD[item.method]
  return y > 0 ? y : 100
}

/* 원물 투입량(g) — 실제로 사야 하는 양. 원가·발주 둘 다 이 값에서 나온다. */
export function rawGramsOf(item) {
  return item.grams / (yieldOf(item) / 100)
}

// 재료 단가(원/g) — 사장님이 '내 매입가'를 넣었으면 그 값, 아니면 기준가
export function perGOf(item) {
  const p = PRODUCTS[item.id]
  if (!p) return 0
  return item.perG != null ? item.perG : p.perG
}

// 재료별 실투입원가 = round( 원물단가 × 원물투입량 )
export function costOf(item) {
  const p = PRODUCTS[item.id]
  if (!p) return 0
  return Math.round(perGOf(item) * rawGramsOf(item))
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

/* 발주 계산: N그릇 팔 때 실제로 '사야 하는' 양과 돈.
   반드시 원가와 같은 투입량(rawGramsOf)에서 나와야 한다 —
   예전엔 여기만 수율을 무시해서, 발주서대로 사면 재료가 모자랐다. */
export function orderPlan(items, bowls) {
  const rows = items.map((it) => {
    const p = PRODUCTS[it.id]
    if (!p) return null
    const raw = rawGramsOf(it)
    return {
      id: it.id, nm: p.nm,
      grams: Math.round(raw * bowls),      // 사야 하는 원물량
      servedGrams: Math.round(it.grams * bowls), // 접시에 올라가는 양
      buy: Math.round(perGOf(it) * raw * bowls),
    }
  }).filter(Boolean)
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

/* ────────────────────────────────────────────────────────────
   시세 변동 영향 — "삼겹살이 20% 오르면 어느 메뉴가 위험한가"
   지금까지 앱에는 이 경로가 아예 없었다. 재료값이 튀어도
   어느 메뉴의 마진이 무너지는지 되짚을 방법이 없었다는 뜻이다.
   ──────────────────────────────────────────────────────────── */

// 어떤 메뉴들이 이 재료를 쓰는가
export function menusUsing(menus, ingredientId) {
  return (menus || []).filter((m) => (m.items || []).some((it) => it.id === ingredientId))
}

/* 재료 단가가 pct% 변할 때 메뉴별 마진 변화. 위험한 순으로 정렬.
   risk: 'high'(마진 20% 미만) | 'mid'(30% 미만) | 'low' */
export function impactOfIngredient(menus, ingredientId, pct, opts = {}) {
  const factor = 1 + pct / 100
  return menusUsing(menus, ingredientId)
    .map((m) => {
      const before = summarize(m.items, m.price, opts)
      const shifted = m.items.map((it) => (it.id === ingredientId ? { ...it, perG: perGOf(it) * factor } : it))
      const after = summarize(shifted, m.price, opts)
      return {
        id: m.id,
        nm: m.nm,
        price: m.price,
        marginBefore: before.margin,
        marginAfter: after.margin,
        delta: after.margin - before.margin,
        costUp: after.cost - before.cost,
        risk: after.margin < 20 ? 'high' : after.margin < 30 ? 'mid' : 'low',
      }
    })
    .sort((a, b) => a.marginAfter - b.marginAfter)
}

/* 여러 재료가 동시에 움직일 때 — 가게 전체에서 가장 먼저 손봐야 할 메뉴.
   shifts: { 재료id: 변동률(%) } */
export function riskBoard(menus, shifts, opts = {}) {
  const ids = Object.keys(shifts || {})
  if (!ids.length) return []
  const seen = new Map()
  ids.forEach((id) => {
    impactOfIngredient(menus, id, shifts[id], opts).forEach((r) => {
      const cur = seen.get(r.id)
      // 같은 메뉴가 여러 재료 영향을 받으면 가장 나쁜 쪽을 남긴다
      if (!cur || r.marginAfter < cur.marginAfter) seen.set(r.id, { ...r, cause: id })
    })
  })
  return [...seen.values()].sort((a, b) => a.marginAfter - b.marginAfter)
}

/* ────────────────────────────────────────────────────────────
   메뉴 엔지니어링 — 인기(판매량) × 마진 사분면 (Kasavana–Smith 응용)
   가게 평균을 경계선으로 네 칸에 분류하고, 칸마다 코칭을 준다.
   ──────────────────────────────────────────────────────────── */
export const QUADRANTS = {
  star:   { key: 'star',   nm: '스타',       s: 'g', short: '밀어주세요', tip: '많이 팔리고 잘 남아요. 가게를 먹여살리는 대표 메뉴 — 계속 밀어주세요. 품절·품질만 조심.' },
  puzzle: { key: 'puzzle', nm: '숨은 보석',   s: 'w', short: '더 팔아요', tip: '마진은 좋은데 덜 팔려요. 대표 사진·세트 구성·추천 배치로 노출을 늘려보세요.' },
  plow:   { key: 'plow',   nm: '일꾼',        s: 'w', short: '마진 올려요', tip: '많이 팔리는데 안 남아요. 재료 대체·사용량·판매가 조정으로 마진을 끌어올리세요.' },
  dog:    { key: 'dog',    nm: '아픈 손가락', s: 'b', short: '손봐야 해요', tip: '적게 팔리고 안 남아요. 레시피를 리뉴얼하거나 메뉴에서 빼는 걸 고민할 때예요.' },
}
export const QUAD_ORDER = ['star', 'plow', 'puzzle', 'dog']

// popOf(menu) = 판매량(그릇). 실판매(오늘 마감)가 있으면 그 값, 없으면 시드 pop.
export function menuMatrix(menus, popOf) {
  if (!menus || !menus.length) return { rows: [], avgMargin: 0, avgPop: 0, counts: {}, maxPop: 1, maxMargin: 1 }
  const withPop = menus.map((m) => ({ m, margin: m.margin, pop: Math.max(0, popOf(m)) }))
  const avgMargin = withPop.reduce((a, r) => a + r.margin, 0) / withPop.length
  const avgPop = withPop.reduce((a, r) => a + r.pop, 0) / withPop.length
  const maxPop = Math.max(1, ...withPop.map((r) => r.pop))
  const maxMargin = Math.max(1, ...withPop.map((r) => r.margin))
  const rows = withPop.map((r) => {
    const hiM = r.margin >= avgMargin, hiP = r.pop >= avgPop
    const q = hiM ? (hiP ? 'star' : 'puzzle') : (hiP ? 'plow' : 'dog')
    const profitEach = Math.round((r.m.price * r.margin) / 100)
    return { m: r.m, margin: r.margin, pop: r.pop, q, profitEach, contrib: profitEach * r.pop }
  }).sort((a, b) => b.contrib - a.contrib)
  const counts = rows.reduce((a, r) => { a[r.q] = (a[r.q] || 0) + 1; return a }, {})
  const totalContrib = rows.reduce((a, r) => a + r.contrib, 0)
  return { rows, avgMargin: Math.round(avgMargin * 10) / 10, avgPop: Math.round(avgPop * 10) / 10, maxPop, maxMargin, counts, totalContrib }
}
