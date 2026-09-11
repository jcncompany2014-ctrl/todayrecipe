/* 계산 불변식 검사 — 숫자끼리 서로 어긋나지 않는지 지킨다.
   실행법: dev 서버를 띄운 뒤 브라우저 콘솔에서
     const t = await import('/test/invariants.mjs'); t.runInvariants()
   (Vite가 모듈을 풀어주므로 별도 테스트 도구 없이 동작한다) */
import { PRODUCTS } from '/src/data/catalog.js'
import { DEFAULT_BUILD } from '/src/data/menus.js'
import { costOf, rawGramsOf, yieldOf, orderPlan, summarize, overheadFor, impactOfIngredient, menusUsing, riskBoard, yieldFromWeights, yieldSourceOf, priceTrendOf, explainCost, safeMarginOf, sig, fixedOverheadFor, SAFE_MARGIN_CEIL, SAFE_MARGIN_FLOOR } from '/src/lib/calc.js'

export function runInvariants() {
  const log = []
  let pass = 0, fail = 0
  const ok = (name, cond, extra = '') => {
    if (cond) { pass++; log.push('PASS  ' + name) }
    else { fail++; log.push('FAIL  ' + name + (extra ? '  -> ' + extra : '')) }
  }

  const items = DEFAULT_BUILD.items

  log.push('[1] 원가와 발주는 같은 투입량에서 나와야 한다')
  for (const bowls of [1, 40, 120]) {
    const plan = orderPlan(items, bowls)
    const food = items.reduce((a, it) => a + costOf(it), 0)
    const diff = Math.abs(plan.total - food * bowls)
    const tol = Math.max(items.length * bowls, food * bowls * 0.002)
    ok(`${bowls}그릇 발주 ${plan.total} ≈ 원가 ${food}×${bowls}`, diff <= tol, `차이 ${diff} > 허용 ${Math.round(tol)}`)
  }

  log.push('[2] 수율<100이면 사야 할 양 > 접시에 올라가는 양')
  for (const it of items) {
    const y = yieldOf(it), raw = rawGramsOf(it), nm = PRODUCTS[it.id].nm
    if (y < 100) ok(`${nm} 수율${y}% : 투입 ${raw.toFixed(1)}g > 사용 ${it.grams}g`, raw > it.grams)
    else ok(`${nm} 수율${y}% : 투입 = 사용`, Math.abs(raw - it.grams) < 1e-9)
  }

  log.push('[3] 흡수 재료(수율>100)는 투입량이 더 적다')
  const id = items[0].id, saved = PRODUCTS[id]
  PRODUCTS[id] = { ...saved, cookable: true, yieldBy: { 삶기: 250 } }
  ok('수율 250% : 200g 쓰려면 80g만 사면 된다', Math.abs(rawGramsOf({ id, grams: 200, method: '삶기' }) - 80) < 1e-9)
  PRODUCTS[id] = saved

  log.push('[4] 원가·마진 범위')
  const s = summarize(items, DEFAULT_BUILD.price)
  ok(`원가 ${s.cost}원 > 0`, s.cost > 0)
  ok(`마진 ${s.margin}% ≤ 100`, s.margin <= 100)
  ok(`부대비용 ${overheadFor(DEFAULT_BUILD.price)}원 > 0`, overheadFor(DEFAULT_BUILD.price) > 0)

  log.push('[5] 시세가 오르면 마진은 내려간다 (방향과 순서)')
  const fakeMenus = [
    { id: 'a', nm: '제육덮밥', price: 9000, items },
    { id: 'b', nm: '비싼메뉴', price: 20000, items },
    { id: 'c', nm: '무관메뉴', price: 8000, items: [] },
  ]
  const key = items[0].id
  const up = impactOfIngredient(fakeMenus, key, 20)
  ok(`이 재료를 쓰는 메뉴만 골라낸다 (${up.length}개, 무관메뉴 제외)`, up.length === 2 && !up.some((r) => r.id === 'c'))
  ok('값이 오르면 마진은 내려간다', up.every((r) => r.delta < 0), JSON.stringify(up.map((r) => r.delta)))
  ok('원가는 올라간다', up.every((r) => r.costUp > 0))
  ok(`위험한 순으로 정렬 (${up.map((r) => r.marginAfter).join(' → ')})`, up[0].marginAfter <= up[1].marginAfter)
  const down = impactOfIngredient(fakeMenus, key, -20)
  ok('값이 내리면 마진은 올라간다', down.every((r) => r.delta > 0))
  ok('변동 0%면 마진 그대로', impactOfIngredient(fakeMenus, key, 0).every((r) => r.delta === 0))
  ok('안 쓰는 재료면 영향 없음', impactOfIngredient(fakeMenus, '없는재료id', 50).length === 0)
  ok('menusUsing이 같은 집합을 준다', menusUsing(fakeMenus, key).length === 2)
  const board = riskBoard(fakeMenus, { [key]: 30 })
  ok(`riskBoard가 가장 위험한 메뉴를 앞에 둔다 (${board.map((r) => r.nm + ' ' + r.marginAfter + '%').join(', ')})`,
     board.length === 2 && board[0].marginAfter <= board[1].marginAfter)
  ok('riskBoard 빈 입력 안전', riskBoard(fakeMenus, {}).length === 0)

  log.push('[6] 실측 수율 — 저울 두 번이 계산을 바꾼다')
  ok('150g -> 120g = 80%', yieldFromWeights(150, 120) === 80)
  ok('150g -> 105g = 70%', yieldFromWeights(150, 105) === 70)
  ok('80g -> 200g = 250% (불어나는 재료)', yieldFromWeights(80, 200) === 250)
  ok('0이나 음수는 거부', yieldFromWeights(0, 100) === null && yieldFromWeights(150, -5) === null)
  ok('글자는 거부', yieldFromWeights('abc', 100) === null)
  ok('말도 안 되는 값은 거부 (1g -> 100g = 10000%)', yieldFromWeights(1, 100) === null)
  const std = { id: items[0].id, grams: 150, method: '볶기' }
  const mea = { id: items[0].id, grams: 150, method: '볶기', yieldPct: 70 }
  ok(`직접 잰 값이 표준값을 이긴다 (${yieldOf(std)}% -> ${yieldOf(mea)}%)`, yieldOf(std) === 80 && yieldOf(mea) === 70)
  ok('출처를 구분해 알려준다', yieldSourceOf(std) === 'standard' && yieldSourceOf(mea) === 'measured')
  ok('수율이 낮아지면 사야 할 양은 늘어난다', rawGramsOf(mea) > rawGramsOf(std))
  ok(`원가도 함께 오른다 (${costOf(std)} -> ${costOf(mea)})`, costOf(mea) > costOf(std))

  log.push('[7] 매입가 이력 — 지난번 대비')
  ok('이력이 없으면 추세도 없다', priceTrendOf({ perG: 9, history: [] }) === null)
  ok('기록 자체가 없으면 null', priceTrendOf(null) === null && priceTrendOf(undefined) === null)
  const upT = priceTrendOf({ perG: 12.5, history: [{ perG: 10 }] })
  ok(`10 -> 12.5 = +25% (오름)`, upT && upT.pct === 25 && upT.up === true)
  const dnT = priceTrendOf({ perG: 11, history: [{ perG: 9 }, { perG: 12.5 }] })
  ok(`가장 최근 값과 비교한다 (12.5 -> 11 = ${dnT && dnT.pct}%)`, dnT && dnT.pct === -12 && dnT.up === false)
  ok('같은 값이면 추세 없음', priceTrendOf({ perG: 9, history: [{ perG: 9 }] }) === null)

  log.push('[8] 계산 과정이 총합과 어긋나지 않는다')
  const exp = explainCost(items, DEFAULT_BUILD.price)
  const sum = summarize(items, DEFAULT_BUILD.price)
  ok(`식자재 합계 일치 (${exp.food} = ${sum.food})`, exp.food === sum.food)
  ok(`총원가 일치 (${exp.cost} = ${sum.cost})`, exp.cost === sum.cost)
  ok(`마진 일치 (${exp.margin}% = ${sum.margin}%)`, exp.margin === sum.margin)
  ok('재료 원가의 합 = 식자재 합계', exp.rows.reduce((a, r) => a + r.cost, 0) === exp.food)
  ok('모든 재료가 출처를 갖는다', exp.rows.every((r) => r.yieldSource && r.perGSource))
  ok('빈 입력에서도 안전', (() => { try { const e = explainCost([], 9000); return e.food === 0 } catch { return false } })())

  log.push('[9] 안전마진은 가게마다 달라야 한다')
  const good = safeMarginOf({ dailyFixed: 200000, dailyGoal: 50000, bowls: 120, avgPrice: 9000 })
  const thin = safeMarginOf({ dailyFixed: 242308, dailyGoal: 100000, bowls: 55, avgPrice: 8500 })
  const none = safeMarginOf({ dailyFixed: 200000, dailyGoal: 0, bowls: 0, avgPrice: 0 })
  const cheap = safeMarginOf({ dailyFixed: 50000, dailyGoal: 0, bowls: 100, avgPrice: 9000 })
  ok(`고정비가 낮으면 안전선도 낮다 (${cheap.pct}% < ${good.pct}%)`, cheap.pct < good.pct)
  ok(`기록이 없으면 기본 30%로 물러난다 (${none.pct}%)`, none.pct === 30 && none.basis === 'default')
  ok(`도달 불가면 상한에서 멈춘다 (${thin.pct}% = 상한)`, thin.reachable === false && thin.pct === SAFE_MARGIN_CEIL)
  ok(`도달 불가면 필요 판매량을 알려준다 (${thin.needBowls}그릇)`, thin.needBowls > thin.bowls)
  ok(`하한 아래로 내려가지 않는다 (${cheap.pct}% >= ${SAFE_MARGIN_FLOOR}%)`, cheap.pct >= SAFE_MARGIN_FLOOR)
  ok('매출이 0이면 기본값', safeMarginOf({ dailyFixed: 100000, bowls: 0, avgPrice: 9000 }).basis === 'default')

  log.push('[10] 신호등 기준선도 가게를 따른다')
  ok('안전선 23%면 25%는 건강', sig(25, 23) === 'g')
  ok('안전선 40%면 25%는 위험', sig(25, 40) === 'b')
  ok('안전선 30%면 25%는 주의', sig(25, 30) === 'w')
  ok('기준선을 안 주면 종전 30% 기준', sig(31) === 'g' && sig(25) === 'w' && sig(19) === 'b')

  log.push('[11] 인건비·가스는 가게마다 바꿀 수 있다')
  const base = fixedOverheadFor({})
  const mine = fixedOverheadFor({ labor: 1500, gas: 700, packaging: 500 })
  ok(`기본값 ${base}원 -> 우리 가게 ${mine}원`, mine === 1500 + 700 + 500 && base !== mine)
  ok('일부만 바꿔도 나머지는 기본값', fixedOverheadFor({ labor: 1000 }) === 1000 + 490 + 300)

  log.push('[12] 빈 장바구니에서도 죽지 않는다')
  ok('빈 items 요약', (() => { try { summarize([], 9000); return true } catch { return false } })())
  ok('빈 items 발주', (() => { try { return orderPlan([], 10).total === 0 } catch { return false } })())

  return { pass, fail, log, foodCost: items.reduce((a, it) => a + costOf(it), 0), summary: summarize(items, DEFAULT_BUILD.price) }
}
