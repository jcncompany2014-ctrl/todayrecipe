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
