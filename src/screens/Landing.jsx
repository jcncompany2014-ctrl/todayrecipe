import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { HeroPhone, StorySection, DashDemo } from '../components/landing/Demos'
import { WholesalePreview, PosPreview, AlertPreview } from '../components/VisionPreviews'

// 시세 티커 — 카탈로그 시드와 동일한 참고 시세
const TICKS = [
  { nm: '삼겹살', pr: '12,000', pct: '▼3%', d: 'dn' },
  { nm: '양파', pr: '2,000', pct: '▼8%', d: 'dn' },
  { nm: '계란', pr: '6,000', pct: '▲5%', d: 'up' },
  { nm: '대파', pr: '3,500', pct: '▼2%', d: 'dn' },
  { nm: '목살', pr: '11,500', pct: '▲4%', d: 'up' },
  { nm: '닭다리살', pr: '7,500', pct: '▼6%', d: 'dn' },
  { nm: '고추장', pr: '9,000', pct: '보통', d: 'fl' },
  { nm: '흰다리새우', pr: '18,000', pct: '▲3%', d: 'up' },
  { nm: '다진마늘', pr: '8,000', pct: '보통', d: 'fl' },
]

export default function Landing() {
  const nav = useNavigate()
  const enter = () => nav('/app')
  const [scrolled, setScrolled] = useState(false)
  const storyRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toStory = () => storyRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="landing">
      <div className={`lnav${scrolled ? ' scrolled' : ''}`}>
        <div className="lnav-in">
          <div className="brand"><span className="logo"><img src="/img/logo.webp" alt="" /></span>오늘 몇 그릇?</div>
          <button className="nav-cta" onClick={enter}>체험해보기</button>
        </div>
      </div>

      {/* 히어로 — 통 그린 풀블리드 */}
      <header className="lhero">
        <div className="lhero-in">
          <div className="lhero-copy">
            <span className="eyebrow">외식 소상공인을 위한 AI 마진 도우미</span>
            <h1><span>담으면</span><span><em className="hl">마진이</em></span><span>살아나요</span></h1>
            <p className="lead">식자재를 장바구니에 담기만 하세요. 조리 <b>수율</b>까지 반영한 진짜 원가·적정 판매가·하루 몇 그릇 팔면 되는지, 담는 순간 숫자가 바로 움직입니다.</p>
            <div className="lhero-ctas">
              <button className="btn-primary" onClick={enter}>체험해보기 <Icon name="chevR" size={18} stroke={2.4} /></button>
              <button className="btn-ghost" onClick={toStory}>1분 만에 어떻게 되는지 보기 ↓</button>
            </div>
            <div className="lhero-micro">회원가입 없이 30초, 바로 계산돼요</div>
          </div>
          <div className="lhero-phone">
            <HeroPhone />
            <div className="lhero-caption">↑ 지금 폰 안에서 실제로 계산되고 있어요</div>
          </div>
        </div>
      </header>

      {/* 시세 티커 — 장부 띠 */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-label"><i className="live-dot" />오늘 참고 시세<i className="tk-div" /></div>
        <div className="ticker-track">
          {[0, 1].map((k) => (
            <div className="ticker-group" key={k}>
              {TICKS.map((t) => (
                <span className="tick" key={t.nm + k}>
                  <b>{t.nm}</b><i className="num">{t.pr}</i>
                  <em className={t.d === 'dn' ? 'g' : t.d === 'up' ? 'b' : ''}>{t.pct}</em>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 문제 공감 */}
      <section className="lsection" id="how">
        <div className="kicker">01 · 왜 필요한가요</div>
        <h2 className="lh2">가격을 감으로 정하면<br />마진이 새요</h2>
        <div className="probcards">
          <div className="probcard"><div className="q">원물 단가, 일일이 찾기 힘들어요</div><p>마트·도매처마다 다른 가격을 매번 비교하는 건 시간 싸움이에요.</p></div>
          <div className="probcard contrast">
            <div className="q">"그냥 GPT한테 물어보면?"</div>
            <p>추정가라 애매하고 매번 리셋돼요. 조리 수율도 못 따지죠.</p>
            <div className="vs">
              <div className="vs-gpt"><span className="vs-tag">GPT</span><span className="vs-blur">아마 5천 원쯤…?</span></div>
              <Icon name="chevR" size={16} stroke={2.2} />
              <div className="vs-us"><span className="vs-tag on">오늘 몇 그릇?</span><span className="vs-sharp num">₩5,310 <i>· 수율 80% 반영</i></span></div>
            </div>
          </div>
          <div className="probcard"><div className="q">팔수록 남는 건지 모르겠어요</div><p>배달 수수료·포장비까지 빼고 나면, 정말 본전은 맞췄는지 헷갈려요.</p></div>
        </div>
      </section>

      {/* 원테이크 스토리 폰 */}
      <div ref={storyRef} />
      <StorySection />

      {/* 신뢰 지표 */}
      <section className="lsection tight">
        <div className="stats">
          <div className="stat"><b>3단계</b><span>담기 → 계산 → 결과<br />떠먹여주는 흐름</span></div>
          <div className="stat"><b>4가지</b><span>생·볶기·삶기·튀김<br />조리 수율 반영</span></div>
          <div className="stat"><b>실시간</b><span>담을 때마다<br />마진이 바로</span></div>
        </div>
      </section>

      {/* 계산 다음 — 이미 구현·배포된 신규 기능들 (예시 아님, 실사용 화면) */}
      <section className="lsection lfeat">
        <div className="kicker">02 · 계산 다음이 진짜</div>
        <h2 className="lh2">담는 걸로 끝이 아니에요.<br />팔고 나서가 진짜죠.</h2>
        <p className="lsectlede">오늘 마감부터 한 달 손익까지, 장사의 뒷정리를 앱이 대신 계산해요. 전부 지금 바로 쓸 수 있어요.</p>
        <div className="featgrid">
          <div className="featcard">
            <div className="fc-head"><span className="fc-ic amber"><Icon name="receipt2" size={18} stroke={1.8} /></span><h3>오늘 장사 마감</h3></div>
            <p>메뉴별 판매 개수만 넣으면 오늘 순이익이 딱.</p>
            <div className="fc-mock">
              <div className="fm-row"><span>오늘 매출</span><b className="num">1,842,000</b></div>
              <div className="fm-row sub"><span>재료·부대비 · 고정비</span><b className="num">−1,082,000</b></div>
              <div className="fm-row net"><span>순이익</span><b className="num g">+760,000</b></div>
              <div className="fm-gauge"><span style={{ width: '84%' }} /></div>
              <div className="fm-cap">본전 넘어 <b className="g">+18그릇</b></div>
            </div>
          </div>
          <div className="featcard">
            <div className="fc-head"><span className="fc-ic green"><Icon name="layers" size={18} stroke={1.8} /></span><h3>세트·콤보 메뉴</h3></div>
            <p>묶어 팔 때 마진이 지켜지는지 먼저 확인해요.</p>
            <div className="fc-mock">
              <div className="fm-combo-nm">제육덮밥 + 김치찌개 세트</div>
              <div className="fm-combo-row"><span className="fm-lab">낱개 합</span><s className="num">17,000</s><Icon name="chevR" size={13} stroke={2.2} /><b className="num">15,300원</b></div>
              <div className="fm-tags"><span className="fm-tag">손님 −1,700</span><span className="fm-tag g"><Icon name="check" size={10} stroke={2.8} />마진 34% · 방어선 통과</span></div>
            </div>
          </div>
          <div className="featcard">
            <div className="fc-head"><span className="fc-ic green"><Icon name="bars" size={18} stroke={1.9} /></span><h3>이번 달 손익 요약</h3></div>
            <p>하루 평균 판매량만 넣으면 이번 달이 예측돼요.</p>
            <div className="fc-mock">
              <div className="fm-row net"><span>이번 달 순이익</span><b className="num g">3,240,000</b></div>
              <div className="fm-goal-top"><span>목표 달성률</span><b className="num">84%</b></div>
              <div className="fm-gauge"><span style={{ width: '84%' }} /></div>
              <div className="fm-cap">효자 메뉴 1위 <b>제육덮밥</b></div>
            </div>
          </div>
          <div className="featcard">
            <div className="fc-head"><span className="fc-ic amber"><Icon name="copy" size={18} stroke={1.8} /></span><h3>메뉴 관리</h3></div>
            <p>이름·사진·레시피까지 기억, 복제 한 번으로 새 메뉴.</p>
            <div className="fc-mock">
              <div className="fm-chips"><span>제육덮밥</span><span>김치찌개</span><span>돈까스</span></div>
              <div className="fm-menu-row"><span className="fm-saved"><Icon name="check" size={10} stroke={2.8} />레시피 5재료 저장됨</span><span className="fm-dup"><Icon name="copy" size={12} stroke={1.9} />복제</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 대시보드 */}
      <section className="lsection ldash">
        <div className="kicker">03 · 한눈에</div>
        <h2 className="lh2">어느 메뉴에서 새는지,<br />한눈에</h2>
        <p className="lsectlede">메뉴별 마진 순위와 건강도를 매일 확인하세요.</p>
        <div className="ldash-phone"><DashDemo /></div>
      </section>

      {/* Coming Soon */}
      <section className="lsection lsoon">
        <div className="kicker">04 · Coming Soon</div>
        <h2 className="lh2">지금은 직접,<br />곧 자동으로</h2>
        <p className="lsectlede">지금도 핵심 계산은 전부 됩니다. 여기에 <b>실시간 도매가</b>와 <b>실제 매출</b>을 이어 붙이면, 손품 팔던 일까지 앱이 대신하게 돼요. 아래는 정식 출시 때의 예시 화면이에요.</p>
        <div className="soon-road"><span className="sr-step on">연동 준비</span><i /><span className="sr-step">베타</span><i /><span className="sr-step">정식 출시</span></div>
        <div className="soongrid">
          <div className="sooncard"><span className="badge">출시 예정</span><div className="ic"><Icon name="link" size={22} stroke={1.7} /></div><h3>실시간 도매가 비교</h3><p>여러 도매처의 오늘 단가를 한 화면에서 비교하고, 최저가로 바로 담아 발주까지.</p><WholesalePreview /></div>
          <div className="sooncard"><span className="badge">출시 예정</span><div className="ic"><Icon name="receipt" size={22} stroke={1.7} /></div><h3>POS·배달앱 매출 연동</h3><p>홀·포장·배달앱 주문을 자동으로 합산해, 오늘 실적과 본전을 실시간으로.</p><PosPreview /></div>
          <div className="sooncard"><span className="badge">출시 예정</span><div className="ic"><Icon name="bell" size={22} stroke={1.7} /></div><h3>시세 변동 알림</h3><p>재료 시세가 튀면 어느 메뉴 마진이 위험한지 콕 집어 알려드려요.</p><AlertPreview /></div>
        </div>
      </section>

      {/* 최종 CTA — 잉크 밴드 */}
      <section className="lfinal inkband">
        <h2>방금 본 제육덮밥,<br />이번엔 사장님 메뉴로.</h2>
        <button className="btn-primary" onClick={enter}>체험해보기 <Icon name="chevR" size={18} stroke={2.4} /></button>
        <div className="lhero-micro">30초면 첫 계산이 나와요</div>
      </section>

      <div className="foot">
        오늘 몇 그릇? · 외식 소상공인 AI 메뉴 마진·가격결정 웹앱<br />
        K-AI 콘텐츠 공모전 Track B · 데모 버전
      </div>
    </div>
  )
}
