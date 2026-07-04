import Icon from './Icon'

/* 비전 예시 화면 목업 — 정식 출시 시 모습의 '미리보기'.
   사양 §8: 비전은 작동하는 척 금지 → 전부 정적, "예시 화면" 라벨 필수.
   실제 업체명 사용 금지 → 공급처·배달앱은 전부 제네릭(A/B/C) 표기. */

function Frame({ children }) {
  return (
    <div className="vprev" aria-label="출시 예정 기능 예시 화면">
      <span className="vprev-tag">예시 화면</span>
      {children}
    </div>
  )
}

/* ① 실시간 도매가 제휴 연동 — 공급처 여러 곳 가격 비교(제네릭) */
export function WholesalePreview() {
  return (
    <Frame>
      <div className="vp-item">
        <span className="vp-thumb"><img src="/img/samgyup.webp" alt="" loading="lazy" /></span>
        <div className="vp-item-tx"><b>삼겹살 1kg</b><span>오늘 도매가 · 06:12 기준</span></div>
        <span className="vp-live"><i />LIVE</span>
      </div>
      <div className="vp-suppliers">
        <div className="vp-sup best">
          <span className="vp-sup-nm">A 정육도매</span>
          <span className="vp-sup-delta g">어제 −300</span>
          <b className="num">11,900원</b><span className="vp-best">최저</span>
        </div>
        <div className="vp-sup"><span className="vp-sup-nm">B 축산유통</span><b className="num">12,100원</b></div>
        <div className="vp-sup"><span className="vp-sup-nm">C 마트도매</span><span className="vp-sup-tag">익일배송</span><b className="num">12,400원</b></div>
      </div>
      <div className="vp-impact"><Icon name="check" size={13} stroke={2.6} />최저가로 담으면 <b>제육덮밥 원가 그릇당 −80원</b></div>
      <div className="vp-cta">최저가로 담기 · 발주까지 3초</div>
    </Frame>
  )
}

/* ② POS·배달앱 매출 연동 — 오늘 실제 판매 자동 추적(배달앱은 제네릭) */
export function PosPreview() {
  return (
    <Frame>
      <div className="vp-pos-top">
        <div><span className="vp-k">오늘 실제 판매</span><div className="vp-big num">41<i>그릇</i></div></div>
        <div className="vp-pos-r"><span className="vp-k">본전까지</span><div className="vp-big num sub">25<i>그릇</i></div></div>
      </div>
      <div className="vp-track"><span style={{ width: '62%' }} /><i style={{ left: '100%' }} /></div>
      <div className="vp-srcs">
        <span><i className="vp-dot" style={{ background: '#59C3E3' }} />배달앱 A 23</span>
        <span><i className="vp-dot" style={{ background: '#F4C542' }} />배달앱 B 11</span>
        <span><i className="vp-dot" style={{ background: '#A39B92' }} />홀·포장 7</span>
      </div>
      <div className="vp-predict"><Icon name="trendup" size={13} stroke={2} />지금 속도면 <b>마감까지 +9그릇</b> 예상 · 어제 같은 시각보다 ▲12%</div>
    </Frame>
  )
}

/* ③ 시세 변동 알림 — 원가가 흔들리면 먼저 알림 */
export function AlertPreview() {
  return (
    <Frame>
      <div className="vp-rule"><Icon name="bell" size={12} stroke={2} />알림 규칙 · 마진 30% 방어선 붕괴 시</div>
      <div className="vp-noti">
        <span className="vp-noti-ic up"><Icon name="bell" size={14} stroke={2} /></span>
        <div className="vp-noti-tx"><b>삼겹살 시세 12%↑</b><span>제육덮밥 마진 41% → 37% · 가격 재점검 필요</span></div>
        <span className="vp-noti-t">지금</span>
      </div>
      <div className="vp-noti dim">
        <span className="vp-noti-ic dn"><Icon name="bell" size={14} stroke={2} /></span>
        <div className="vp-noti-tx"><b>양파 시세 8%↓</b><span>지금 담아두면 그릇당 −40원 절약 타이밍</span></div>
        <span className="vp-noti-t">2시간 전</span>
      </div>
      <div className="vp-noti calm">
        <span className="vp-noti-ic ok"><Icon name="check" size={13} stroke={2.6} /></span>
        <div className="vp-noti-tx"><b>이번 주 마진 안정</b><span>방어선 30% 아래로 내려간 메뉴 없음</span></div>
        <span className="vp-noti-t">어제</span>
      </div>
    </Frame>
  )
}
