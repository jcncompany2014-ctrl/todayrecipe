import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { SEED_MENUS, DEFAULT_BUILD } from '../data/menus'
import { PRODUCTS } from '../data/catalog'
import { overheadFor } from '../lib/calc'

const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)

const clone = (o) => JSON.parse(JSON.stringify(o))

export function StoreProvider({ children }) {
  // 등록 메뉴 (누적 — GPT 채팅과 달리 데이터가 쌓임)
  const [menus, setMenus] = useState(() => clone(SEED_MENUS))
  // 현재 빌드 중인 메뉴 (마트→장바구니→결과 공유 상태)
  const [build, setBuild] = useState(() => clone(DEFAULT_BUILD))
  // 온보딩 — 앱 첫 진입 시 1회(인메모리, 사양상 저장 없음). '건너뛰기'/'시작하기'로 해제.
  const [onboarded, setOnboardedState] = useState(false)
  const setOnboarded = useCallback((v = true) => setOnboardedState(v), [])
  // 하루 고정비 — 홈·대시보드·결과가 공유. 사장님이 바꾸면 본전 그릇 수가 전부 재계산됨.
  const [dailyFixed, setDailyFixed] = useState(243000)
  // 하루 목표 순이익 — 목표 역산(결과·대시보드 공유). 이만큼 벌려면 몇 그릇?
  const [goal, setGoalState] = useState(100000)
  const setGoal = useCallback((g) => setGoalState((prev) => {
    const v = typeof g === 'function' ? g(prev) : g
    return Math.max(0, Math.min(1000000, Math.round(v / 10000) * 10000))
  }), [])
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

  const setPrice = useCallback((price) => setBuild((b) => ({ ...b, price })), [])

  const setBuildMeta = useCallback((meta) => setBuild((b) => ({ ...b, ...meta })), [])

  // 새 메뉴 시작 (+ FAB)
  const newBuild = useCallback(() => {
    setBuild({ id: 'm' + Date.now(), nm: '새 메뉴', price: 9000, icon: 'donbap', items: [] })
  }, [])

  // 저장된 메뉴 열기 — 기본 빌드(제육덮밥)는 실제 재료로, 나머지는 저장값에서 원가 역산
  const loadMenu = useCallback((menu) => {
    if (menu.id === DEFAULT_BUILD.id) { setBuild(clone(DEFAULT_BUILD)); return }
    const cost = Math.round((menu.price * (100 - menu.margin)) / 100)
    setBuild({ id: menu.id, nm: menu.nm, price: menu.price, icon: menu.icon, img: menu.img, items: [], fixedFood: Math.max(0, cost - overheadFor(menu.price)) })
  }, [])

  // 결과 저장 → 메뉴판에 누적(upsert)
  const saveBuild = useCallback((margin) => {
    setMenus((list) => {
      const cleared = list.map((m) => ({ ...m, badge: undefined }))
      const idx = cleared.findIndex((m) => m.id === build.id)
      const entry = { id: build.id, nm: build.nm, price: build.price, margin, icon: build.icon || 'donbap', img: build.img, badge: '방금 계산' }
      if (idx >= 0) { cleared[idx] = entry; return cleared }
      return [entry, ...cleared]
    })
  }, [build])

  const value = {
    onboarded, setOnboarded, goal, setGoal,
    menus, build, dailyFixed, setDailyFixed, costOpts, setRate, setPackaging,
    inBuild, toggleItem, removeItem, setGrams, setMethod, setPrice, setBuildMeta,
    newBuild, loadMenu, saveBuild, toast, toastMsg,
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
