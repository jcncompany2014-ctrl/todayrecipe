/* 영속성 — 사장님이 입력한 것이 기기에 남는다.
   원칙 1) 저장 실패가 앱을 죽이지 않는다. 사파리 프라이빗·용량초과·쿠키차단 전부 무해하게.
   원칙 2) 스키마 버전을 키에 박는다. 구조가 바뀌면 옛 저장본은 자동으로 무시된다. */
import { useState, useEffect, useRef } from 'react'

const NS = 'todayrecipe'
export const SCHEMA = 1

const keyOf = (k) => `${NS}:v${SCHEMA}:${k}`

let ok = null
function usable() {
  if (ok != null) return ok
  try {
    const probe = `${NS}:__probe`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    ok = true
  } catch {
    ok = false // 프라이빗 모드·저장 차단 — 앱은 인메모리로 계속 동작
  }
  return ok
}
export const storageAvailable = () => usable()

export function load(k, fallback) {
  if (!usable()) return fallback
  try {
    const raw = window.localStorage.getItem(keyOf(k))
    if (raw == null) return fallback
    const v = JSON.parse(raw)
    return v === undefined || v === null ? fallback : v
  } catch {
    return fallback // 손상된 값은 조용히 버리고 기본값으로
  }
}

export function save(k, v) {
  if (!usable()) return false
  try {
    window.localStorage.setItem(keyOf(k), JSON.stringify(v))
    return true
  } catch {
    return false // 용량 초과 등 — 무시(계산은 계속된다)
  }
}

/* 저장된 것 전부 삭제 — 에러 복구·초기화용. 다른 앱 키는 건드리지 않는다. */
export function clearAll() {
  if (!usable()) return
  try {
    const doomed = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith(`${NS}:`)) doomed.push(k)
    }
    doomed.forEach((k) => window.localStorage.removeItem(k))
  } catch { /* 무시 */ }
}

/* useState와 동일하게 쓰되, 값이 바뀌면 기기에 남는다.
   validate(v) → 복원값이 쓸 수 있는 형태인지 검사. 실패하면 initial로 되돌린다. */
export function usePersistentState(k, initial, validate) {
  const [v, setV] = useState(() => {
    const base = typeof initial === 'function' ? initial() : initial
    const restored = load(k, base)
    if (validate && !validate(restored)) return base
    return restored
  })
  // 첫 렌더에서는 쓰지 않는다 — 복원 직후 같은 값을 되쓰는 낭비 방지
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    save(k, v)
  }, [k, v])
  return [v, setV]
}
