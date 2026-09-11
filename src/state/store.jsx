import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { DEFAULT_BUILD } from '../data/menus'
import { SEED_STORES } from '../data/stores'
import { PRODUCTS } from '../data/catalog'
import { overheadFor, safeMarginOf } from '../lib/calc'
import { usePersistentState } from './persist'

/* 복원값 검증 — 손상되거나 옛 구조면 조용히 시드로 되돌린다.
   저장된 값을 그대로 믿으면, 한 번 깨진 값이 앱을 영구히 죽인다. */
const okStores = (v) => Array.isArray(v) && v.length > 0
  && v.every((s) => s && typeof s.id === 'string' && Array.isArray(s.menus))
const okBuild = (v) => v && typeof v === 'object' && Array.isArray(v.items) && typeof v.price === 'number'
const okNum = (v) => typeof v === 'number' && isFinite(v) && v >= 0
/* 부대비용 기본값 — 종전 동작과 동일(전부 배달·정액 0). 사장님이 우리 가게 실제 비중을 넣으면 그때부터 달라진다. */
const DEFAULT_COST_OPTS = { rate: 0.12, packaging: 300, flatFee: 0, deliveryShare: 1, labor: 880, gas: 490 }
const okMap = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
const okBool = (v) => typeof v === 'boolean'

const EMPTY = {}   // 참조가 매 렌더 바뀌지 않게 고정
/* 날짜 키 — 로컬 기준 YYYY-MM-DD. UTC를 쓰면 새벽 장사가 어제로 밀린다. */
const pad2 = (n) => String(n).padStart(2, '0')
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const shiftDay = (key, delta) => {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + delta))
}

const StoreCtx = createContext(null)
export const useStore = () => {
  const ctx = useContext(StoreCtx)
  // Provider 밖에서 부르거나, 개발 중 HMR로 컨텍스트가 끊긴 순간을 알아보기 쉽게.
  // 알 수 없는 구조분해 오류 대신 분명한 메시지를 남긴다(ErrorBoundary가 받아준다).
  if (!ctx) throw new Error('useStore()는 StoreProvider 안에서만 쓸 수 있어요')
  return ctx
}

const clone = (o) => JSON.parse(JSON.stringify(o))

export function StoreProvider({ children }) {
  // 사업장(가게) 목록 — 한 사장님이 여러 매장을 관리. 매장마다 자기 메뉴판.
  const [stores, setStores] = usePersistentState('stores', () => clone(SEED_STORES), okStores)
  const [currentStoreId, setCurrentStoreId] = usePersistentState('currentStoreId', SEED_STORES[0].id, (v) => typeof v === 'string')
  const currentStore = stores.find((s) => s.id === currentStoreId) || stores[0] || SEED_STORES[0]
  // 현재 매장의 메뉴판 (기존 코드가 쓰던 mens 그대로 — 파생값)
  const menus = currentStore.menus
  // 현재 매장의 메뉴판만 갱신 (setMenus 시그니처 유지)
  const setMenus = useCallback((updater) => {
    setStores((all) => all.map((s) => (s.id === currentStoreId
      ? { ...s, menus: typeof updater === 'function' ? updater(s.menus) : updater }
      : s)))
  }, [currentStoreId])
  const enterStore = useCallback((id) => setCurrentStoreId(id), [])
  // 현재 빌드 중인 메뉴 (마트→장바구니→결과 공유 상태)
  const [build, setBuild] = usePersistentState('build', () => clone(DEFAULT_BUILD), okBuild)
  // 온보딩 — 앱 첫 진입 시 1회(인메모리, 사양상 저장 없음). '건너뛰기'/'시작하기'로 해제.
  const [onboarded, setOnboardedState] = usePersistentState('onboarded', false, okBool)
  const setOnboarded = useCallback((v = true) => setOnboardedState(v), [])
  // 사장님은 '하루' 고정비를 모른다 — 아는 건 '한 달' 월세·인건비와 목표.
  // 한 달 값 + 영업일수만 넣으면 앱이 하루치로 자동 환산한다.
  const [monthlyFixed, setMF] = usePersistentState('monthlyFixed', 6300000, okNum) // 한 달 고정비(월세·인건비·공과금)
  const [monthlyGoal, setMG] = usePersistentState('monthlyGoal', 2600000, okNum)  // 한 달 목표 순이익
  const [workDays, setWD] = usePersistentState('workDays', 26, okNum)           // 한 달 영업일수
  const step10 = (v, prev, max) => {
    const x = typeof v === 'function' ? v(prev) : v
    return Math.max(0, Math.min(max, Math.round(x / 100000) * 100000))
  }
  const setMonthlyFixed = useCallback((v) => setMF((p) => step10(v, p, 100000000)), [])
  const setMonthlyGoal = useCallback((v) => setMG((p) => step10(v, p, 100000000)), [])
  const setWorkDays = useCallback((v) => setWD((p) => {
    const x = typeof v === 'function' ? v(p) : v
    return Math.max(1, Math.min(31, Math.round(x)))
  }), [])
  // 하루치 파생값 — 기존 계산(본전·목표 역산)은 그대로 이 값을 쓴다.
  const dailyFixed = Math.max(1, Math.round(monthlyFixed / workDays))
  const dailyGoal = Math.round(monthlyGoal / workDays)
  /* 내 매입가 원장 — 재료 단가는 메뉴가 아니라 '가게'에 속한다.
     예전엔 build 안에만 붙어서, 같은 앞다리살을 12개 메뉴에 12번 입력해야 했다.
     { 재료id: { perG, at } } — at은 언제 넣은 값인지(나중에 시세 이력의 시작점). */
  const [ingredientPrices, setIngredientPrices] = usePersistentState('ingredientPrices', {}, okMap)
  /* 우리 가게 실측 수율 — { 재료id: { 조리법: 수율% } }
     앱의 심장인 수율을 '표준 상수'에서 '이 주방에서 잰 데이터'로 바꾼다.
     "수율 80%의 근거가 뭐냐"는 질문이 여기서 사라진다. */
  const [measuredYields, setMeasuredYields] = usePersistentState('measuredYields', {}, okMap)

  /* 가게에 쌓인 값(매입가·실측 수율)을 레시피 항목에 입힌다.
     메뉴를 열거나 재료를 담을 때마다 '우리 가게 기준'으로 맞춰준다. */
  const applyLedger = useCallback((items, ledger, yields) => {
    const L = ledger || ingredientPrices
    const Y = yields || measuredYields
    return (items || []).map((it) => {
      const next = { ...it }
      const rec = L[it.id]
      if (rec && rec.perG > 0) next.perG = rec.perG
      else delete next.perG
      const my = Y[it.id] && Y[it.id][it.method]
      if (my > 0) next.yieldPct = my
      else delete next.yieldPct
      return next
    })
  }, [ingredientPrices, measuredYields])

  // 저울 두 번으로 잰 값을 기록 — 같은 재료·같은 조리법에 전부 적용된다
  const setMeasuredYield = useCallback((id, method, pct) => {
    if (!(pct > 0)) return
    setMeasuredYields((M) => ({ ...M, [id]: { ...(M[id] || {}), [method]: pct } }))
    setBuild((b) => ({ ...b, items: b.items.map((it) => (it.id === id && it.method === method ? { ...it, yieldPct: pct } : it)) }))
  }, [setMeasuredYields])

  // 표준값으로 되돌리기
  const clearMeasuredYield = useCallback((id, method) => {
    setMeasuredYields((M) => {
      const cur = { ...(M[id] || {}) }
      delete cur[method]
      if (!Object.keys(cur).length) { const { [id]: _, ...rest } = M; return rest }
      return { ...M, [id]: cur }
    })
    setBuild((b) => ({ ...b, items: b.items.map((it) => { if (it.id !== id || it.method !== method) return it; const { yieldPct, ...rest } = it; return rest }) }))
  }, [setMeasuredYields])

  /* 부대비용은 '가게'의 속성이다 — 홀 전용 백반집과 배달 위주 가게가
     같은 수수료를 물면 안 된다. 전에는 전역 1벌이라 매장을 바꿔도 그대로였다. */
  const costOpts = { ...DEFAULT_COST_OPTS, ...(currentStore.costOpts || {}) }
  const patchCostOpts = useCallback((patch) => {
    setStores((all) => all.map((s) => (s.id === currentStoreId
      ? { ...s, costOpts: { ...DEFAULT_COST_OPTS, ...(s.costOpts || {}), ...patch } }
      : s)))
  }, [currentStoreId, setStores])
  const setRate = useCallback((rate) => patchCostOpts({ rate: Math.min(0.2, Math.max(0, rate)) }), [patchCostOpts])
  const setPackaging = useCallback((p) => patchCostOpts({ packaging: Math.max(0, Math.round(p)) }), [patchCostOpts])
  // 건당 정액 배달비(배달앱 요금제마다 다름)
  const setFlatFee = useCallback((v) => patchCostOpts({ flatFee: Math.max(0, Math.round(v)) }), [patchCostOpts])
  // 매출 중 배달 비중 0~1 — 홀 전용이면 0으로 두면 배달비가 아예 안 붙는다
  const setDeliveryShare = useCallback((v) => patchCostOpts({ deliveryShare: Math.min(1, Math.max(0, v)) }), [patchCostOpts])
  // 그릇당 인건비·가스 — 백반집과 스테이크집이 같을 리 없다
  const setLabor = useCallback((v) => patchCostOpts({ labor: Math.max(0, Math.round(v)) }), [patchCostOpts])
  const setGas = useCallback((v) => patchCostOpts({ gas: Math.max(0, Math.round(v)) }), [patchCostOpts])

  // 토스트
  const [toastMsg, setToastMsg] = useState(null)
  const tRef = useRef()
  const toast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(tRef.current)
    tRef.current = setTimeout(() => setToastMsg(null), 2400)
  }, [])

  const inBuild = useCallback((id) => build.items.some((it) => it.id === id), [build])

  const toggleItem = useCallback((id) => {
    setBuild((b) => {
      const exists = b.items.some((it) => it.id === id)
      if (exists) return { ...b, items: b.items.filter((it) => it.id !== id) }
      const p = PRODUCTS[id]
      const rec = ingredientPrices[id]
      const fresh = { id, grams: p.defG, method: p.method }
      if (rec && rec.perG > 0) fresh.perG = rec.perG   // 전에 넣어둔 내 매입가가 있으면 바로 적용
      const my = measuredYields[id] && measuredYields[id][p.method]
      if (my > 0) fresh.yieldPct = my                  // 직접 잰 수율도 함께
      return { ...b, items: [...b.items, fresh] }
    })
  }, [ingredientPrices, measuredYields])

  const removeItem = useCallback((id) => {
    setBuild((b) => ({ ...b, items: b.items.filter((it) => it.id !== id) }))
  }, [])

  const setGrams = useCallback((id, grams) => {
    setBuild((b) => ({
      ...b,
      items: b.items.map((it) => (it.id === id ? { ...it, grams: Math.max(0, grams) } : it)),
    }))
  }, [])

  const setMethod = useCallback((id, method) => {
    setBuild((b) => ({
      ...b,
      items: b.items.map((it) => {
        if (it.id !== id) return it
        const next = { ...it, method }
        // 조리법이 바뀌면 수율도 그 조리법으로 잰 값을 쓴다(없으면 표준값)
        const my = measuredYields[id] && measuredYields[id][method]
        if (my > 0) next.yieldPct = my
        else delete next.yieldPct
        return next
      }),
    }))
  }, [measuredYields])

  // '내 매입가' — 재료 단가(원/g)를 사장님 값으로. 0/무효면 무시.
  const setItemPerG = useCallback((id, perG) => {
    // 소수점 유지 — 양파 2원/g 같은 저가 재료는 정수로 반올림하면 입력 자체가 무의미해진다
    const n = Number(perG)
    const v = isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0
    if (!v) return
    // 원장에 기록 → 모든 메뉴에 적용. 값을 덮어쓰지 않고 지난 값을 이력으로 남긴다.
    setIngredientPrices((L) => {
      const prev = L[id]
      if (prev && prev.perG === v) return L            // 같은 값이면 이력을 늘리지 않는다
      const past = Array.isArray(prev && prev.history) ? prev.history : []
      const history = (prev && prev.perG > 0 ? [...past, { perG: prev.perG, at: prev.at }] : past).slice(-20)
      return { ...L, [id]: { perG: v, at: new Date().toISOString(), history } }
    })
    setBuild((b) => ({ ...b, items: b.items.map((it) => (it.id === id ? { ...it, perG: v } : it)) }))
  }, [setIngredientPrices])
  // 기준가로 되돌리기 — 원장에서도 지운다
  const resetItemPerG = useCallback((id) => {
    setIngredientPrices((L) => { const { [id]: _, ...rest } = L; return rest })
    setBuild((b) => ({ ...b, items: b.items.map((it) => { if (it.id !== id) return it; const { perG, ...rest } = it; return rest }) }))
  }, [setIngredientPrices])

  const setPrice = useCallback((price) => setBuild((b) => ({ ...b, price })), [])

  const setBuildMeta = useCallback((meta) => setBuild((b) => ({ ...b, ...meta })), [])

  // 새 메뉴 시작 (+ FAB)
  const newBuild = useCallback(() => {
    setBuild({ id: 'm' + Date.now(), nm: '새 메뉴', price: 9000, icon: 'donbap', items: [] })
  }, [])

  // 저장된 메뉴 열기 — 저장된 레시피(items)가 있으면 그대로 복원, 없으면 원가 역산
  const loadMenu = useCallback((menu) => {
    if (menu.items && menu.items.length) {
      // 저장된 레시피에 '내 가게 매입가'를 다시 입힌다 — 원장이 단일 진실이다
      setBuild({ id: menu.id, nm: menu.nm, price: menu.price, icon: menu.icon, img: menu.img, items: applyLedger(clone(menu.items)) })
      return
    }
    if (menu.fixedFood != null) { // 레시피 없이 원가만 아는 메뉴 — 그 값을 그대로 쓴다
      setBuild({ id: menu.id, nm: menu.nm, price: menu.price, icon: menu.icon, img: menu.img, items: [], fixedFood: menu.fixedFood })
      return
    }
    if (menu.id === DEFAULT_BUILD.id) { setBuild(clone(DEFAULT_BUILD)); return }
    const cost = Math.round((menu.price * (100 - menu.margin)) / 100)
    // 부대비용은 가게 설정(costOpts) 기준으로 역산해야 한다 — 기본값으로 풀면 마진이 되돌아간다
    setBuild({ id: menu.id, nm: menu.nm, price: menu.price, icon: menu.icon, img: menu.img, items: [], fixedFood: Math.max(0, cost - overheadFor(menu.price, costOpts)) })
  }, [costOpts, applyLedger])

  // 메뉴 편집(이름·사진 등) — 메뉴판에서 바로 수정
  const updateMenu = useCallback((id, patch) => {
    setMenus((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }, [setMenus])

  // 메뉴 복제 — 원본 바로 아래에 '(복사)'로
  const duplicateMenu = useCallback((id) => {
    setMenus((list) => {
      const idx = list.findIndex((m) => m.id === id)
      if (idx < 0) return list
      const copy = { ...clone(list[idx]), id: 'm' + Date.now(), nm: `${list[idx].nm} (복사)`.slice(0, 24), badge: undefined }
      const next = [...list]; next.splice(idx + 1, 0, copy); return next
    })
  }, [setMenus])

  // 메뉴 삭제
  const deleteMenu = useCallback((id) => setMenus((list) => list.filter((m) => m.id !== id)), [setMenus])

  /* 결과 저장 → 메뉴판에 누적(upsert). 레시피(items)도 함께 기억.
     price를 인자로 받는 이유: setPrice는 비동기다. 같은 틱에 build.price를 읽으면
     아직 옛 값이라 '옛 가격 + 새 마진'이라는 있을 수 없는 조합이 저장된다. */
  const saveBuild = useCallback((price, margin) => {
    setMenus((list) => {
      const cleared = list.map((m) => ({ ...m, badge: undefined }))
      const idx = cleared.findIndex((m) => m.id === build.id)
      const patch = {
        id: build.id, nm: build.nm, price, margin,
        icon: build.icon || 'donbap', img: build.img,
        items: clone(build.items), badge: '방금 계산',
      }
      if (build.fixedFood != null) patch.fixedFood = build.fixedFood // 레시피 없는 메뉴의 원가 근거 보존
      // 기존 항목의 나머지 필드(판매량 pop 등)를 통째로 날리지 않는다
      if (idx >= 0) { cleared[idx] = { ...cleared[idx], ...patch }; return cleared }
      return [patch, ...cleared]
    })
  }, [build, setMenus])

  /* 판매 기록 — { 가게id: { 날짜: { 메뉴id: 개수 } } }
     전에는 날짜도 가게 구분도 없었다. 그래서 (1) 어제 판 것이 오늘 것으로 남았고,
     (2) 2호점 판매량이 본점 대시보드에 합산됐다. 둘 다 여기서 해결된다. */
  const [salesLog, setSalesLog] = usePersistentState('salesLog', {}, okMap)
  const todayKey = dayKey()
  const soldToday = (salesLog[currentStoreId] && salesLog[currentStoreId][todayKey]) || EMPTY

  const setSold = useCallback((id, count) => setSalesLog((L) => {
    const store = L[currentStoreId] || {}
    const day = store[todayKey] || {}
    const cur = day[id] || 0
    const next = typeof count === 'function' ? count(cur) : count
    return { ...L, [currentStoreId]: { ...store, [todayKey]: { ...day, [id]: Math.max(0, Math.round(next)) } } }
  }), [currentStoreId, todayKey, setSalesLog])

  const resetSold = useCallback(() => setSalesLog((L) => {
    const store = { ...(L[currentStoreId] || {}) }
    delete store[todayKey]
    return { ...L, [currentStoreId]: store }
  }), [currentStoreId, todayKey, setSalesLog])

  // 특정 날짜의 판매 기록 — '어제보다'를 말할 수 있게 하는 최소 장치
  const soldOn = useCallback((key) => (salesLog[currentStoreId] && salesLog[currentStoreId][key]) || EMPTY, [salesLog, currentStoreId])
  const yesterdaySold = soldOn(shiftDay(todayKey, -1))
  // 최근 n일 (오늘 포함) — 추이 표시용
  const recentDays = useCallback((n = 7) => {
    const out = []
    for (let i = n - 1; i >= 0; i--) {
      const k = shiftDay(todayKey, -i)
      const day = (salesLog[currentStoreId] && salesLog[currentStoreId][k]) || EMPTY
      out.push({ key: k, sold: day, count: Object.values(day).reduce((a, v) => a + v, 0) })
    }
    return out
  }, [salesLog, currentStoreId, todayKey])

  /* 우리 가게 안전마진 — 업계 통념 30%가 아니라 이 가게 고정비에서 역산한다.
     판매량은 최근 실제 기록을 우선하고, 없으면 메뉴판의 예상 판매량을 쓴다. */
  const avgPrice = menus.length ? Math.round(menus.reduce((a, m) => a + m.price, 0) / menus.length) : 0
  const recent = recentDays(7).filter((d) => d.count > 0)
  const bowlsPerDay = recent.length
    ? Math.round(recent.reduce((a, d) => a + d.count, 0) / recent.length)
    : menus.reduce((a, m) => a + (m.pop || 0), 0)
  const safeMargin = safeMarginOf({ dailyFixed, dailyGoal, bowls: bowlsPerDay, avgPrice })
  // 계산 함수들이 opts.safeMargin 을 보도록 함께 실어 보낸다
  const costOptsWithSafe = { ...costOpts, safeMargin: safeMargin.pct }

  const value = {
    onboarded, setOnboarded,
    stores, currentStore, currentStoreId, enterStore,
    monthlyFixed, monthlyGoal, workDays, setMonthlyFixed, setMonthlyGoal, setWorkDays,
    dailyFixed, dailyGoal,
    menus, build, costOpts: costOptsWithSafe, setRate, setPackaging, setFlatFee, setDeliveryShare, setLabor, setGas,
    safeMargin,
    ingredientPrices, measuredYields, setMeasuredYield, clearMeasuredYield,
    inBuild, toggleItem, removeItem, setGrams, setMethod, setItemPerG, resetItemPerG, setPrice, setBuildMeta,
    newBuild, loadMenu, saveBuild, updateMenu, duplicateMenu, deleteMenu,
    soldToday, setSold, resetSold, soldOn, yesterdaySold, recentDays, todayKey,
    toast, toastMsg,
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
