import Icon from './Icon'

/* 비전 예시 화면 목업 — 정식 출시 시 모습의 '미리보기'.
   사양 §8: 비전은 작동하는 척 금지 → 전부 정적, "예시 화면" 라벨 필수. */

function Frame({ children }) {
  return (
    <div className="vprev" aria-label="출시 예정 기능 예시 화면">
      <span className="vprev-tag">예시 화면</span>
      {children}
    </div>
  )
}

/* ① 실시간 도매가 제휴 연동 — 공급처 3곳 가격 비교 */
export function WholesalePreview() {
  return (
    <Frame>
      <div className="vp-item">
        <span className="vp-thumb"><img src="/img/samgyup.webp" alt="" loading="lazy" /></span>
        <div className="vp-item-tx"><b>삼겹살 1kg</b><span>오늘 도매가 · 실시간</span></div>
        <span className="vp-live"><i />LIVE</span>
      </div>
      <div className="vp-suppliers">
        <div className="vp-sup best"><span className="vp-sup-nm">미트박스</span><b className="num">11,900원</b><span className="vp-best">최저</span></div>
        <div className="vp-sup"><span className="vp-sup-nm">A도매유통</span><b className="num">12,100원</b></div>
        <div className="vp-sup"><span className="vp-sup-nm">B축산마트</span><b className="num">12,400원</b></div>
      </div>
      <div className="vp-cta">최저가로 담기 · 발주까지 3초</div>
    </Frame>
  )
}

/* ② POS·배달앱 매출 연동 — 오늘 실제 판매 자동 추적 */
export function PosPreview() {
  return (
    <Frame>
      <div className="vp-pos-top">
        <div><span className="vp-k">오늘 실제 판매</span><div className="vp-big num">41<i>그릇</i></div></div>
        <div className="vp-pos-r"><span className="vp-k">본전까지</span><div className="vp-big num sub">25<i>그릇</i></div></div>
      </div>
      <div className="vp-track"><span style={{ width: '62%' }} /><i style={{ left: '100%' }} /></div>
      <div className="vp-srcs">
        <span><i className="vp-dot" style={{ background: '#59C3E3' }} />배민 23</span>
        <span><i className="vp-dot" style={{ background: '#F4C542' }} />쿠팡이츠 11</span>
        <span><i className="vp-dot" style={{ background: '#A39B92' }} />홀·포장 7</span>
      </div>
    </Frame>
  )
}

/* ③ 시세 변동 알림 — 원가가 흔들리면 먼저 알림 */
export function AlertPreview() {
  return (
    <Frame>
      <div className="vp-noti">
        <span className="vp-noti-ic up"><Icon name="bell" size={14} stroke={2} /></span>
        <div className="vp-noti-tx"><b>삼겹살 시세 12%↑</b><span>제육덮밥 마진 41% → 37% · 가격 재점검 필요</span></div>
        <span className="vp-noti-t">지금</span>
      </div>
      <div className="vp-noti dim">
        <span className="vp-noti-ic dn"><Icon name="bell" size={14} stroke={2} /></span>
        <div className="vp-noti-tx"><b>양파 시세 8%↓</b><span>지금 담아두면 원가 절약 타이밍</span></div>
        <span className="vp-noti-t">2시간 전</span>
      </div>
    </Frame>
  )
}
