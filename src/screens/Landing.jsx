import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Photo from '../components/Photo'

export default function Landing() {
  const nav = useNavigate()
  const enter = () => nav('/app')

  return (
    <div className="landing">
      <div className="nav">
        <div className="brand">
          <span className="logo"><Photo src="/img/logo.webp" icon="bowl" iconSize={18} /></span>
          오늘 몇 그릇?
        </div>
        <button className="nav-cta" onClick={enter}>체험해보기</button>
      </div>

      <div className="wrap">
        {/* 히어로 */}
        <section className="hero">
          <span className="eyebrow">외식 소상공인을 위한 AI 마진 도우미</span>
          <h1>감으로 정하던<br />메뉴 가격,<br />숫자로.</h1>
          <p className="lede">
            식자재를 장바구니에 담으면, 조리 <b>수율</b>까지 반영한 진짜 1인분 원가부터
            적정 판매가, 하루 몇 그릇 팔아야 본전인지까지 알려드려요.
          </p>
          <div className="ctas">
            <button className="btn-primary" onClick={enter}>체험해보기 <Icon name="chevR" size={18} stroke={2.4} /></button>
            <button className="btn-ghost" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>어떻게 다른가요?</button>
          </div>
        </section>

        {/* 폰 미리보기 (티저 — 실제 작동은 체험해보기) */}
        <div className="phone-peek">
          <div className="mini">
            <div className="mini-screen">
              <div style={{ background: 'var(--ink)', color: '#fff', borderRadius: 18, padding: '15px 17px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>오늘 이만큼은 팔아야 본전</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <b className="num" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: .95 }}>89</b>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>그릇</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>팔면 본전</span>
                </div>
                <div style={{ marginTop: 9, paddingTop: 9, borderTop: '1px dashed rgba(255,255,255,.16)', fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,.5)' }}>
                  하루 고정비 243,000원 ÷ 평균 2,730원
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 15 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--tile)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)' }}><Photo src="/img/dish_jeyuk.webp" icon="donbap" iconSize={22} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>제육덮밥</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }} className="num">그릇당 +3,690원</div>
                </div>
                <b className="num g" style={{ fontSize: 18, fontWeight: 800 }}>41%</b>
              </div>
            </div>
          </div>
        </div>

        {/* 문제 공감 */}
        <section className="section" id="how">
          <div className="kicker">왜 필요한가요</div>
          <h2>가격을 감으로 정하면<br />마진이 새요</h2>
          <div className="probcards">
            <div className="probcard"><div className="q">원물 단가, 일일이 찾기 힘들어요</div><p>마트·도매처마다 다른 가격을 매번 비교하는 건 시간 싸움이에요.</p></div>
            <div className="probcard"><div className="q">"그냥 GPT한테 물어보면?"</div><p>추정가라 애매하고, 매번 리셋돼 내 메뉴로 쌓이지 않아요. 조리 수율도 못 따져요.</p></div>
            <div className="probcard"><div className="q">팔수록 남는 건지 모르겠어요</div><p>배달 수수료·포장비까지 빼고 나면, 정말 본전은 맞췄는지 헷갈려요.</p></div>
          </div>
        </section>

        {/* 차별점 — 수율 */}
        <section className="section">
          <div className="kicker">우리가 다른 점</div>
          <h2>원물 단가가 아니라<br />‘조리 후’ 진짜 원가</h2>
          <p className="sectlede">고기 150g을 볶으면 수율 80% — 실제 원가는 표기 단가보다 비싸집니다. 그 차이를 계산에 넣는 게 핵심이에요.</p>
          <div className="yieldblock">
            <div className="big">앞다리살 150g, 볶으면 <span className="accent">120g</span></div>
            <div className="yieldmath">
              <div className="pill">표기 단가<b className="num">1,350원</b></div>
              <span className="op">→</span>
              <div className="pill">실제 원가<b className="num">1,688원</b></div>
              <span className="op">=</span>
              <div className="pill">수율 80% 반영<b className="num">+25%</b></div>
            </div>
            <p>이 한 끗이 마진을 가릅니다. ‘오늘 몇 그릇?’은 모든 재료에 수율을 적용해 진짜 원가를 만들어요.</p>
          </div>
        </section>

        {/* 성과/신뢰 */}
        <section className="section">
          <div className="stats">
            <div className="stat"><b className="num">3단계</b><span>담기 → 계산 → 결과<br />떠먹여주는 흐름</span></div>
            <div className="stat"><b className="num">4가지</b><span>생·볶기·삶기·튀김<br />조리 수율 반영</span></div>
            <div className="stat"><b className="num">실시간</b><span>담을 때마다<br />마진이 바로</span></div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="section">
          <div className="kicker">Coming Soon</div>
          <h2>다음 단계의 비전</h2>
          <div className="soongrid">
            <div className="sooncard"><span className="badge">출시 예정</span><div className="ic"><Icon name="link" size={22} stroke={1.7} /></div><h3>실시간 도매가 제휴 연동</h3><p>도매 플랫폼과 정식 제휴해, 오늘의 단가를 비교하고 바로 발주까지.</p></div>
            <div className="sooncard"><span className="badge">출시 예정</span><div className="ic"><Icon name="receipt" size={22} stroke={1.7} /></div><h3>POS·배달앱 매출 연동</h3><p>오늘 실제 몇 그릇 팔렸는지 자동 추적, 예상과 실제를 나란히.</p></div>
            <div className="sooncard"><span className="badge">출시 예정</span><div className="ic"><Icon name="bell" size={22} stroke={1.7} /></div><h3>시세 변동 알림</h3><p>원가가 흔들리면 먼저 알려드려, 제때 가격을 다듬게.</p></div>
          </div>
        </section>

        {/* 최종 CTA */}
        <section className="finalcta">
          <h2>지금, 한 그릇의<br />진짜 원가를 보세요</h2>
          <div className="ctas">
            <button className="btn-primary" onClick={enter}>체험해보기 <Icon name="chevR" size={18} stroke={2.4} /></button>
          </div>
        </section>

        <div className="foot">
          오늘 몇 그릇? · 외식 소상공인 AI 메뉴 마진·가격결정 웹앱<br />
          K-AI 콘텐츠 공모전 Track B · 데모 버전
        </div>
      </div>
    </div>
  )
}
