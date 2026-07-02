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

      {/* 히어로 */}
      <header className="lhero">
        <div className="lhero-copy">
          <span className="eyebrow">외식 소상공인을 위한 AI 마진 도우미</span>
          <h1><span>담으면</span><span><em className="hl">마진이</em></span><span>살아나요</span></h1>
          <p className="lead">식자재를 마켓컬리처럼 장바구니에 담기만 하세요. 조리 <b>수율</b>까지 반영한 진짜 1인분 원가·적정 판매가·하루 몇 그릇이 본전인지, 담는 순간 숫자가 바로 움직여요.</p>
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
      </header>

      {/* 시세 티커 — 장부 띠 */}
      <div className="ticker" aria-hidden="true">
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

      {/* 대시보드 */}
      <section className="lsection ldash">
        <div className="kicker">02 · 한눈에</div>
        <h2 className="lh2">어느 메뉴에서 새는지,<br />한눈에</h2>
        <p className="lsectlede">메뉴별 마진 순위와 건강도를 매일 확인하세요.</p>
        <div className="ldash-phone"><DashDemo /></div>
      </section>

      {/* Coming Soon */}
      <section className="lsection">
        <div className="kicker">03 · Coming Soon</div>
        <h2 className="lh2">다음 단계의 비전</h2>
        <p className="lsectlede">정식 출시되면 이런 모습이에요 — 예시 화면으로 미리 보세요.</p>
        <div className="soongrid">
          <div className="sooncard"><span className="badge">출시 예정</span><div className="ic"><Icon name="link" size={22} stroke={1.7} /></div><h3>실시간 도매가 제휴 연동</h3><p>도매 플랫폼과 정식 제휴해, 오늘의 단가를 비교하고 최저가로 바로 발주까지.</p><WholesalePreview /></div>
          <div className="sooncard"><span className="badge">출시 예정</span><div className="ic"><Icon name="receipt" size={22} stroke={1.7} /></div><h3>POS·배달앱 매출 연동</h3><p>오늘 실제 몇 그릇 팔렸는지 자동 추적, 예상과 실제를 나란히.</p><PosPreview /></div>
          <div className="sooncard"><span className="badge">출시 예정</span><div className="ic"><Icon name="bell" size={22} stroke={1.7} /></div><h3>시세 변동 알림</h3><p>원가가 흔들리면 먼저 알려드려, 제때 가격을 다듬게.</p><AlertPreview /></div>
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
