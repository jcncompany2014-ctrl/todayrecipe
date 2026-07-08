import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { DEFAULT_BUILD } from '../data/menus'
import { SEED_STORES } from '../data/stores'
import { PRODUCTS } from '../data/catalog'
import { overheadFor } from '../lib/calc'

const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)

const clone = (o) => JSON.parse(JSON.stringify(o))

export function StoreProvider({ children }) {
  // 사업장(가게) 목록 — 한 사장님이 여러 매장을 관리. 매장마다 자기 메뉴판.
  const [stores, setStores] = useState(() => clone(SEED_STORES))
  const [currentStoreId, setCurrentStoreId] = useState(SEED_STORES[0].id) // 기본 = 첫 매장(견고성)
  const currentStore = stores.find((s) => s.id === currentStoreId) || stores[0]
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
  const [build, setBuild] = useState(() => clone(DEFAULT_BUILD))
  // 온보딩 — 앱 첫 진입 시 1회(인메모리, 사양상 저장 없음). '건너뛰기'/'시작하기'로 해제.
  const [onboarded, setOnboardedState] = useState(false)
  const setOnboarded = useCallback((v = true) => setOnboardedState(v), [])
  // 사장님은 '하루' 고정비를 모른다 — 아는 건 '한 달' 월세·인건비와 목표.
  // 한 달 값 + 영업일수만 넣으면 앱이 하루치로 자동 환산한다.
  const [monthlyFixed, setMF] = useState(6300000) // 한 달 고정비(월세·인건비·공과금)
  const [monthlyGoal, setMG] = useState(2600000)  // 한 달 목표 순이익
  const [workDays, setWD] = useState(26)           // 한 달 영업일수
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
  // 가게 부대비용 설정 — 배달수수료율·포장비. 장바구니에서 조절하면 모든 계산에 반영.
  const [costOpts, setCostOpts] = useState({ rate: 0.12, packaging: 300 })
  const setRate = useCallback((rate) => setCostOpts((o) => ({ ...o, rate: Math.min(0.2, Math.max(0, rate)) })), [])
  const setPackaging = useCallback((p) => setCostOpts((o) => ({ ...o, packaging: Math.max(0, p) })), [])

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
      return { ...b, items: [...b.items, { id, grams: p.defG, method: p.method }] }
    })
  }, [])

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
      items: b.items.map((it) => (it.id === id ? { ...it, method } : it)),
    }))
  }, [])

  // '내 매입가' — 재료 단가(원/g)를 사장님 값으로. 0/무효면 무시.
  const setItemPerG = useCallback((id, perG) => {
    const v = Math.max(0, Math.round(Number(perG)))
    if (!v) return
    setBuild((b) => ({ ...b, items: b.items.map((it) => (it.id === id ? { ...it, perG: v } : it)) }))
  }, [])
  // 기준가로 되돌리기 — override 제거
  const resetItemPerG = useCallback((id) => {
    setBuild((b) => ({ ...b, items: b.items.map((it) => { if (it.id !== id) return it; const { perG, ...rest } = it; return rest }) }))
  }, [])

  const setPrice = useCallback((price) => setBuild((b) => ({ ...b, price })), [])

  const setBuildMeta = useCallback((meta) => setBuild((b) => ({ ...b, ...meta })), [])

  // 새 메뉴 시작 (+ FAB)
  const newBuild = useCallback(() => {
    setBuild({ id: 'm' + Date.now(), nm: '새 메뉴', price: 9000, icon: 'donbap', items: [] })
  }, [])

  // 저장된 메뉴 열기 — 저장된 레시피(items)가 있으면 그대로 복원, 없으면 원가 역산
  const loadMenu = useCallback((menu) => {
    if (menu.items && menu.items.length) {
      setBuild({ id: menu.id, nm: menu.nm, price: menu.price, icon: menu.icon, img: menu.img, items: clone(menu.items) })
      return
    }
    if (menu.id === DEFAULT_BUILD.id) { setBuild(clone(DEFAULT_BUILD)); return }
    const cost = Math.round((menu.price * (100 - menu.margin)) / 100)
    setBuild({ id: menu.id, nm: menu.nm, price: menu.price, icon: menu.icon, img: menu.img, items: [], fixedFood: Math.max(0, cost - overheadFor(menu.price)) })
  }, [])

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

  // 결과 저장 → 메뉴판에 누적(upsert). 레시피(items)도 함께 기억.
  const saveBuild = useCallback((margin) => {
    setMenus((list) => {
      const cleared = list.map((m) => ({ ...m, badge: undefined }))
      const idx = cleared.findIndex((m) => m.id === build.id)
      const entry = { id: build.id, nm: build.nm, price: build.price, margin, icon: build.icon || 'donbap', img: build.img, items: clone(build.items), badge: '방금 계산' }
      if (idx >= 0) { cleared[idx] = entry; return cleared }
      return [entry, ...cleared]
    })
  }, [build, setMenus])

  // 오늘 장사 마감 — 메뉴별 판매 개수(인메모리). 연타 시 값이 밀리지 않게 함수형 업데이터 허용.
  const [soldToday, setSoldToday] = useState({})
  const setSold = useCallback((id, count) => setSoldToday((s) => {
    const cur = s[id] || 0
    const next = typeof count === 'function' ? count(cur) : count
    return { ...s, [id]: Math.max(0, Math.round(next)) }
  }), [])
  const resetSold = useCallback(() => setSoldToday({}), [])

  const value = {
    onboarded, setOnboarded,
    stores, currentStore, currentStoreId, enterStore,
    monthlyFixed, monthlyGoal, workDays, setMonthlyFixed, setMonthlyGoal, setWorkDays,
    dailyFixed, dailyGoal,
    menus, build, costOpts, setRate, setPackaging,
    inBuild, toggleItem, removeItem, setGrams, setMethod, setItemPerG, resetItemPerG, setPrice, setBuildMeta,
    newBuild, loadMenu, saveBuild, updateMenu, duplicateMenu, deleteMenu,
    soldToday, setSold, resetSold,
    toast, toastMsg,
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
