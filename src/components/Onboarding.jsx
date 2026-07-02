import { useState, useRef } from 'react'
import { useStore } from '../state/store'
import Icon from './Icon'

// 슬라이드 비주얼 — 앱의 실제 화면 언어(카드·그린·숫자) 재사용
function SceneCart() {
  return (
    <div className="onb-card">
      <div className="oc-head">
        <span className="oc-ic"><Icon name="cart" size={16} stroke={1.9} /></span>
        <b>장바구니</b><span className="oc-cnt">재료 5</span>
      </div>
      <div className="oc-chips"><span>삼겹살</span><span>양파</span><span>고추장</span><span className="more">+2</span></div>
      <div className="oc-margin">
        <span>예상 마진</span>
        <b className="num">41%</b>
        <i className="up"><Icon name="chevR" size={13} stroke={2.8} /></i>
      </div>
    </div>
  )
}
function SceneYield() {
  return (
    <div className="onb-card">
      <div className="oy-tag">수율 80%</div>
      <div className="oy-row"><span>원물</span><i className="oy-bar"><b className="ghost" style={{ width: '100%' }} /></i><em className="num">150g</em></div>
      <div className="oy-row"><span>실제</span><i className="oy-bar"><b style={{ width: '80%' }} /></i><em className="num">120g</em></div>
      <p className="oy-note">볶으면 줄어드는 양까지 원가에 반영해요</p>
    </div>
  )
}
function SceneBreakeven() {
  return (
    <div className="onb-card dark">
      <span className="ob-lab">하루 본전</span>
      <div className="ob-big"><b className="num">66</b><span>그릇</span></div>
      <div className="ob-diag"><span className="ob-dot" />AI 진단 · 개선책까지</div>
    </div>
  )
}

const SLIDES = [
  { k: 'STEP 1', t: ['담기만 하면', '계산이 끝나요'], d: '마켓처럼 재료를 담으면, 담는 순간 1인분 원가와 마진이 바로 움직여요.', S: SceneCart },
  { k: 'STEP 2', t: ['조리 수율까지', '반영한 진짜 원가'], d: '볶고 삶으면 줄어드는 양(수율)까지 계산해요. 원물 단가만 볼 때와 원가가 달라요.', S: SceneYield },
  { k: 'STEP 3', t: ['하루 몇 그릇이', '본전인지까지'], d: '매일 팔아야 할 그릇 수, 그리고 마진을 높이는 AI 진단·개선책까지 알려드려요.', S: SceneBreakeven },
]

export default function Onboarding() {
  const { setOnboarded } = useStore()
  const [i, setI] = useState(0)
  const x0 = useRef(null)
  const last = i === SLIDES.length - 1
  const go = (n) => setI(Math.max(0, Math.min(SLIDES.length - 1, n)))
  const end = (x) => {
    if (x0.current == null) return
    const dx = x - x0.current
    x0.current = null
    if (dx < -45) go(i + 1)
    else if (dx > 45) go(i - 1)
  }

  return (
    <div className="onb">
      <button className="onb-skip" onClick={() => setOnboarded(true)}>건너뛰기</button>
      <div className="onb-track"
        onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
        onTouchEnd={(e) => end(e.changedTouches[0].clientX)}
        onMouseDown={(e) => (x0.current = e.clientX)}
        onMouseUp={(e) => end(e.clientX)}
        onMouseLeave={() => (x0.current = null)}>
        <div className="onb-slides" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((s, idx) => {
            const S = s.S
            return (
              <div className="onb-slide" key={idx}>
                <div className="onb-scene"><S /></div>
                <div className="onb-copy">
                  <span className="onb-kicker">{s.k}</span>
                  <h2>{s.t.map((l, j) => <span key={j}>{l}</span>)}</h2>
                  <p>{s.d}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="onb-foot">
        <div className="onb-dots">
          {SLIDES.map((_, idx) => (
            <button key={idx} aria-label={`${idx + 1}단계`} className={`onb-dot${idx === i ? ' on' : ''}`} onClick={() => go(idx)} />
          ))}
        </div>
        <button className="onb-cta" onClick={() => (last ? setOnboarded(true) : go(i + 1))}>
          {last ? '시작하기' : '다음'}<Icon name="chevR" size={18} stroke={2.4} />
        </button>
      </div>
    </div>
  )
}
