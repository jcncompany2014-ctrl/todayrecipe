import { useState, useEffect, useRef } from 'react'

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 뷰포트 진입 감지
export function useInView(threshold = 0.45) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting && e.intersectionRatio >= threshold),
      { threshold: [0, threshold, 1] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

// 현재값에서 target으로 부드럽게 트윈 (target이 바뀔 때마다). reduced-motion이면 즉시.
export function useTween(target, active, { dur = 800 } = {}) {
  const [val, setVal] = useState(target)
  const cur = useRef(target)
  useEffect(() => {
    if (!active || reducedMotion()) { cur.current = target; setVal(target); return }
    let raf, start
    const from = cur.current
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / dur)
      const v = from + (target - from) * ease(p)
      cur.current = v; setVal(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, dur])
  return val
}

// rAF 카운트업 — active가 true가 되면 from→to로. reduced-motion이면 즉시 to.
export function useCountUp(to, active, { from = 0, dur = 900, playId = 0 } = {}) {
  const [val, setVal] = useState(active ? to : from)
  useEffect(() => {
    if (!active) { setVal(from); return }
    if (reducedMotion()) { setVal(to); return }
    let raf, start
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / dur)
      setVal(from + (to - from) * ease(p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, to, from, dur, playId])
  return val
}
