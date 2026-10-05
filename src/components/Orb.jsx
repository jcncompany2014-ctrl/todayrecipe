import { useEffect, useState } from 'react'
import { ThinkingOrb } from 'thinking-orbs'

/* 앱이 '일하고 있다'는 걸 보여주는 오브.
   thinking-orbs (MIT, Jakub Antalik) — 캔버스 2D, 의존성 없음.

   화면 코드는 라이브러리 용어(solving·searching…)가 아니라
   '무슨 일을 하는 중인지'로 부른다. 그래야 나중에 연출을 바꿔도
   화면을 고칠 필요가 없다. */
const MOOD = {
  calculating: 'solving',     // 원가·마진을 계산하는 중 — 띠가 흩어졌다 맞춰진다
  searching:   'searching',   // 재료·시세를 찾는 중 — 지구본을 훑는다
  diagnosing:  'composing',   // AI 진단 — 여러 갈래가 하나로 엮인다
  building:    'shaping',     // 레시피를 짓는 중 — 윤곽이 모양을 바꾼다
  connecting:  'connecting',  // 데이터를 잇는 중
  idle:        'breathing',   // 기다리는 중 · 빈 상태 — 천천히 숨쉰다
  working:     'working',     // 일반 처리
  listening:   'listening',   // 입력을 받는 중
}

/* 캔버스는 CSS 변수를 못 읽는다 — 토큰 값을 그대로 넘긴다 */
const TONE = {
  pine:  '#0C2B1E',   // 밝은 면 위 기본
  green: '#0E7A4F',   // 밝은 면 위 강조(--good-2)
  mint:  '#41D392',   // 딥그린 면 위
  ink:   '#17130F',
  muted: '#6B635A',
  white: '#FFFFFF',
}

/* 모션을 줄여달라는 설정이면 멈춘 한 장면으로 보여준다 */
function useReducedMotion() {
  const q = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
  const [reduce, setReduce] = useState(() => !!(q && q.matches))
  useEffect(() => {
    if (!q) return
    const on = (e) => setReduce(e.matches)
    q.addEventListener ? q.addEventListener('change', on) : q.addListener(on)
    return () => (q.removeEventListener ? q.removeEventListener('change', on) : q.removeListener(on))
  }, [q])
  return reduce
}

export default function Orb({
  mood = 'working',
  size = 64,
  tone = 'pine',
  speed = 1,
  label,
  className,
  style,
}) {
  const reduce = useReducedMotion()
  return (
    <ThinkingOrb
      state={MOOD[mood] || 'working'}
      size={size}
      color={TONE[tone] || tone}
      speed={speed}
      paused={reduce}
      aria-label={label}
      className={className}
      style={style}
    />
  )
}

export const ORB_MOODS = Object.keys(MOOD)
