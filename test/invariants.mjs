/* 계산 불변식 검사 — 숫자끼리 서로 어긋나지 않는지 지킨다.
   실행법: dev 서버를 띄운 뒤 브라우저 콘솔에서
     const t = await import('/test/invariants.mjs'); t.runInvariants()
   (Vite가 모듈을 풀어주므로 별도 테스트 도구 없이 동작한다) */
import { PRODUCTS } from '/src/data/catalog.js'
import { DEFAULT_BUILD } from '/src/data/menus.js'
import { costOf, rawGramsOf, yieldOf, orderPlan, summarize, overheadFor } from '/src/lib/calc.js'

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

  log.push('[5] 빈 장바구니에서도 죽지 않는다')
  ok('빈 items 요약', (() => { try { summarize([], 9000); return true } catch { return false } })())
  ok('빈 items 발주', (() => { try { return orderPlan([], 10).total === 0 } catch { return false } })())

  return { pass, fail, log, foodCost: items.reduce((a, it) => a + costOf(it), 0), summary: summarize(items, DEFAULT_BUILD.price) }
}
