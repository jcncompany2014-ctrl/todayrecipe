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
        <em className="oc-was num">52%</em>
        <i className="oc-arrow"><Icon name="chevR" size={12} stroke={2.8} /></i>
        <b className="num">41%</b>
      </div>
    </div>
  )
}
function SceneYield() {
  return (
    <div className="onb-card">
      <div className="oy-head"><span className="oy-tag">수율 80%</span><span className="oy-badge">진짜 원가 +25%</span></div>
      <div className="oy-row"><span>원물</span><i className="oy-bar"><b className="ghost" style={{ width: '100%' }} /></i><em className="num">150g</em></div>
      <div className="oy-row"><span>실제</span><i className="oy-bar"><b style={{ width: '80%' }} /></i><em className="num">120g</em></div>
      <p className="oy-note">표기 <b className="num">1,350원</b> → 볶으면 <b className="num">1,688원</b></p>
    </div>
  )
}
function SceneBreakeven() {
  return (
    <div className="onb-card dark">
      <span className="ob-lab">하루 목표</span>
      <div className="ob-big"><b className="num">126</b><span>그릇</span></div>
      <div className="ob-diag"><span className="ob-dot" />AI: 마라탕 마진 24% → 당면 대체 시 31%</div>
    </div>
  )
}
function SceneClose() {
  return (
    <div className="onb-card">
      <div className="ocl-head"><span className="ocl-lab">오늘 마감</span><span className="ocl-ok"><Icon name="check" size={11} stroke={2.8} />정산 완료</span></div>
      <div className="ocl-net"><span>오늘 순이익</span><b className="num">+214,000<i>원</i></b></div>
      <div className="ocl-bar"><span style={{ width: '78%' }} /><i className="ocl-be" style={{ left: '62%' }} /></div>
      <div className="ocl-sub"><span className="g">본전 넘음</span><span className="ocl-month">이번 달 목표 <b className="num">84%</b></span></div>
    </div>
  )
}

const SLIDES = [
  { k: 'STEP 1', t: ['담기만 하면', '계산이 끝나요'], d: '마켓처럼 재료를 담으면, 담는 순간 1인분 원가와 마진이 바로 움직여요.', S: SceneCart },
  { k: 'STEP 2', t: ['조리 수율까지', '반영한 진짜 원가'], d: '볶고 삶으면 줄어드는 양(수율)까지 계산해요. 원물 단가만 볼 때와 원가가 달라요.', S: SceneYield },
  { k: 'STEP 3', t: ['하루 몇 그릇 팔면', '목표를 채우는지'], d: '한 달 목표만 정하면 하루 몇 그릇 팔면 되는지 역산하고, 마진 높이는 AI 진단까지 알려드려요.', S: SceneBreakeven },
  { k: 'STEP 4', t: ['장사 끝나면', '오늘 정산까지'], d: '메뉴별 판매 개수만 넣으면 오늘 순이익이 딱. 이번 달 손익도 매일 자동으로 쌓여요.', S: SceneClose },
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
