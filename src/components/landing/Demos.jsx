import { useState, useEffect, useRef } from 'react'
import Icon, { TrendTri } from '../Icon'
import { useInView, useCountUp, reducedMotion } from './hooks'

const won = (n) => Math.round(n).toLocaleString('ko-KR')

/* 반투명 탭 링 (손가락 대신, 프리미엄) */
function TapRing({ show, style }) {
  return <span className={`tapring${show ? ' on' : ''}`} style={style} aria-hidden="true" />
}

function StatusBar() {
  return (
    <div className="d-status">
      <span className="num">9:41</span>
      <span className="d-status-r">
        <svg width="15" height="10" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="20" height="10" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="21" height="10" rx="3" stroke="currentColor" strokeWidth="1.2" opacity=".5" /><rect x="2.8" y="2.8" width="15" height="6.4" rx="1.6" fill="currentColor" /></svg>
      </span>
    </div>
  )
}

/* =========================================================
   히어로 폰 — 식자재 마트 '담기 마법' 무한 루프
   ========================================================= */
const POP = [
  { id: 'samgyup', nm: '삼겹살', pr: '12,000', img: '/img/samgyup.webp' },
  { id: 'onion', nm: '양파', pr: '2,000', img: '/img/onion.webp' },
  { id: 'egg', nm: '계란', pr: '6,000', img: '/img/egg.webp' },
]

export function HeroPhone() {
  const [ref, inView] = useInView(0.3)
  const base = { n: 3, m: 52, food: '1,790', onion: false, samgyup: false, tap: null, toast: null, tint: false }
  const [s, setS] = useState(base)

  useEffect(() => {
    if (reducedMotion() || !inView) { setS({ ...base, m: 51, onion: true, n: 4, food: '1,910' }); return }
    let timers = []; let cancelled = false
    const at = (d, fn) => timers.push(setTimeout(fn, d))
    const run = () => {
      if (cancelled || document.hidden) return
      setS(base)
      at(700, () => setS(v => ({ ...v, tap: 'onion' })))
      at(1250, () => setS(v => ({ ...v, onion: true, n: 4, food: '1,910', m: 51, tap: null, toast: '양파 담았어요 · 예상 마진 52% → 51%' })))
      at(3300, () => setS(v => ({ ...v, toast: null })))
      at(3800, () => setS(v => ({ ...v, tap: 'samgyup' })))
      at(4350, () => setS(v => ({ ...v, samgyup: true, n: 5, food: '3,350', m: 49, tint: true, tap: null, toast: '삼겹살 담았어요 · 예상 마진 51% → 49%' })))
      at(4850, () => setS(v => ({ ...v, tint: false })))
      at(6400, () => setS(v => ({ ...v, toast: null })))
      at(7300, run)
    }
    run()
    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [inView])

  const added = { samgyup: s.samgyup, onion: s.onion, egg: false }

  return (
    <div className="demo-phone hero-phone" ref={ref} aria-label="식자재 마트에서 재료를 담으면 예상 마진이 실시간으로 바뀌는 화면">
      <div className="demo-screen scr-hero">
        <StatusBar />
        <div className="d-mkt-head">
          <div className="d-mkt-title">재료 담기</div>
          <div className="d-chip"><span className="d-chip-ic"><img src="/img/dish_jeyuk.webp" alt="" /></span><b>제육덮밥</b><span>담는 중</span></div>
        </div>
        <div className="d-sec">사장님이 많이 담아요</div>
        <div className="d-pop">
          {POP.map((p) => (
            <div className="d-hcard" key={p.id}>
              <div className="d-himg"><img src={p.img} alt={p.nm} /><span className={`d-add${added[p.id] ? ' in' : ''}`}><Icon name={added[p.id] ? 'check' : 'plus'} size={15} stroke={2.5} /></span></div>
              <div className="d-hnm">{p.nm}</div>
              <div className="d-hpr num">{p.pr}원<i>/kg</i></div>
            </div>
          ))}
          <TapRing show={s.tap === 'samgyup'} style={{ left: 78, top: 150 }} />
          <TapRing show={s.tap === 'onion'} style={{ left: 190, top: 150 }} />
        </div>
        <div className="d-mbar-wrap"><span className="d-mbar-lab">예상 마진</span><div className="d-mbar"><span className="gb" style={{ width: `${s.m}%` }} /></div></div>

        <div className="d-cartbar">
          <span className="d-cb-cart"><Icon name="cart" size={17} stroke={1.8} /><span className="d-cb-badge num">{s.n}</span></span>
          <span className="d-cb-tx"><b>장바구니 {s.n}개</b><span className="num">식자재 {s.food}원</span></span>
          <span className={`d-cb-margin${s.tint ? ' tint' : ''}`}><span>예상 마진</span><b className="num">{s.m}%</b></span>
        </div>

        <div className={`d-toast${s.toast ? ' show' : ''}`}>{s.toast || ''}</div>
      </div>
    </div>
  )
}

/* =========================================================
   스토리 미니 화면들 (sticky 폰 안에서 스크롤로 전환)
   ========================================================= */
function HomeMini({ active, playId }) {
  const [bump, setBump] = useState(false)
  const fixed = bump ? 270000 : 243000
  const bowlsTarget = bump ? 99 : 90
  const bowls = Math.round(useCountUp(bowlsTarget, active, { dur: 900, playId: playId + (bump ? 100 : 0) }))
  useEffect(() => {
    if (!active || reducedMotion()) { setBump(false); return }
    setBump(false)
    const t = setTimeout(() => setBump(true), 2100)
    return () => clearTimeout(t)
  }, [active, playId])

  const menus = [
    { nm: '제육덮밥', pr: '9,000', prof: '+3,690', m: 41, s: 'g', img: '/img/dish_jeyuk.webp' },
    { nm: '마라탕', pr: '9,000', prof: '+2,160', m: 24, s: 'w', img: '/img/dish_mala.webp' },
  ]
  return (
    <div className="d-home">
      <div className="d-ledger">
        <div className="d-ledger-lab">오늘 본전을 맞추려면 · 가게 평균 기준</div>
        <div className="d-ledger-num"><b className="num">{bowls}</b><span className="u">그릇</span><span className="t">정도 팔면 돼요</span></div>
        <div className="d-ledger-rule" />
        <div className="d-ledger-calc">하루 고정비 <b className="num">{won(fixed)}원</b> ÷ 메뉴 평균 <b className="num">2,730원</b></div>
        <div className="d-fx"><span>하루 고정비</span><span className={`d-fx-step${bump ? ' hit' : ''}`}><i>−</i><b className="num">{won(fixed)}</b><i className="plus">+</i></span></div>
      </div>
      <div className="d-mlist">
        {menus.map((m, i) => (
          <div className="d-mcard" key={m.nm}>
            <span className="d-mphoto"><img src={m.img} alt={m.nm} /></span>
            <div className="d-mbody">
              <div className="d-mtop"><b>{m.nm}</b><span className="num">{m.pr}원</span></div>
              <div className={`d-mbar2`}><span className={`${m.s}b`} style={{ width: active ? `${m.m}%` : '0%', transitionDelay: `${0.2 + i * 0.12}s` }} /></div>
            </div>
            <b className={`d-mpct num ${m.s}`}>{m.m}%</b>
          </div>
        ))}
      </div>
    </div>
  )
}

function MarketMini({ active, playId }) {
  const [added, setAdded] = useState(false)
  const [tap, setTap] = useState(false)
  const [showBar, setShowBar] = useState(false)
  const [m, setM] = useState(52)
  useEffect(() => {
    if (!active) { setAdded(false); setTap(false); setShowBar(false); setM(52); return }
    if (reducedMotion()) { setAdded(true); setShowBar(true); setM(50); return }
    setAdded(false); setShowBar(false); setM(52)
    const t1 = setTimeout(() => setTap(true), 800)
    const t2 = setTimeout(() => { setTap(false); setAdded(true); setShowBar(true) }, 1300)
    const t3 = setTimeout(() => setM(50), 1700)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [active, playId])

  const cards = [
    { nm: '삼겹살', img: '/img/samgyup.webp' }, { nm: '양파', img: '/img/onion.webp' },
    { nm: '계란', img: '/img/egg.webp' }, { nm: '대파', img: '/img/daepa.webp' }, { nm: '고추장', img: '/img/gochu.webp' },
  ]
  const rows = [
    { nm: '삼겹살', pr: '12,000', unit: '/kg', img: '/img/samgyup.webp', trend: 'dn', t: '3% 저렴' },
    { nm: '양파', pr: '2,000', unit: '/kg', img: '/img/onion.webp', trend: 'dn', t: '8% 저렴' },
  ]
  return (
    <div className="d-mkt">
      <div className="d-cats">{['전체', '정육', '수산', '청과', '양념'].map((c, i) => <span key={c} className={`d-cat${i === 0 ? ' on' : ''}`}>{c}</span>)}</div>
      <div className="d-sec">사장님이 많이 담아요</div>
      <div className="d-pop-clip"><div className={`d-pop-row${active ? ' run' : ''}`}>
        {cards.map((c) => <div className="d-hcard sm" key={c.nm}><div className="d-himg"><img src={c.img} alt={c.nm} /></div><div className="d-hnm">{c.nm}</div></div>)}
      </div></div>
      <div className="d-vlist">
        {rows.map((r, i) => (
          <div className="d-vitem" key={r.nm}>
            <span className="d-vthumb"><img src={r.img} alt={r.nm} /></span>
            <div className="d-vmid"><b>{r.nm}</b><span className="num">{r.pr}원<i>{r.unit}</i></span><span className="d-trend dn"><TrendTri dir="dn" />▼{r.t}</span></div>
            <span className={`d-addv${i === 0 && added ? ' in' : ''}`}><Icon name={i === 0 && added ? 'check' : 'plus'} size={16} stroke={2.4} /></span>
            {i === 0 && <TapRing show={tap} style={{ right: 10, top: 14 }} />}
          </div>
        ))}
      </div>
      <div className={`d-cartbar float${showBar ? ' show' : ''}`}>
        <span className="d-cb-cart"><Icon name="cart" size={16} stroke={1.8} /><span className="d-cb-badge num">2</span></span>
        <span className="d-cb-tx"><b>장바구니 2개</b><span className="num">식자재 1,790원</span></span>
        <span className="d-cb-margin"><span>예상 마진</span><b className="num">{m}%</b></span>
      </div>
    </div>
  )
}

function CartMini({ active, playId }) {
  const [fry, setFry] = useState(false)
  const [callout, setCallout] = useState(false)
  const marginTarget = fry ? 40 : 41
  const margin = Math.round(useCountUp(marginTarget, active, { dur: 700, playId: playId + (fry ? 50 : 0) }))
  useEffect(() => {
    if (!active) { setFry(false); setCallout(false); return }
    if (reducedMotion()) { return }
    setFry(false); setCallout(false)
    const t1 = setTimeout(() => { setFry(true); setCallout(true) }, 1300)
    const t2 = setTimeout(() => setCallout(false), 3200)
    const t3 = setTimeout(() => setFry(false), 3400)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [active, playId])
  const yld = fry ? 75 : 80
  const val = fry ? '1,800' : '1,688'
  const cooks = ['생', '볶기', '삶기', '튀김']
  const activeCook = fry ? '튀김' : '볶기'
  return (
    <div className="d-cart">
      <div className="d-sum">
        <div className="d-sum-top"><span>제육덮밥 · 판매가 <b className="num">9,000원</b></span></div>
        <div className="d-sum-mid"><span className="lab">예상 마진</span><b className="num g">{margin}%</b></div>
        <div className="d-sum-bar"><span className="gb" style={{ width: active ? `${margin}%` : '0%' }} /></div>
      </div>
      <div className="d-sec">담은 재료</div>
      <div className="d-ing">
        <span className="d-vthumb"><img src="/img/apdari.webp" alt="앞다리살" /></span>
        <div className="d-ing-mid"><b>앞다리살</b><span>9원/g · 150g</span>
          <div className="d-cooks">{cooks.map((c) => <span key={c} className={`d-cook${c === activeCook ? ' on' : ''}`}>{c}</span>)}<TapRing show={callout} style={{ right: 4, top: -2 }} /></div>
        </div>
        <div className="d-ing-cost"><span className="d-yld">수율 {yld}%</span><b className={`num d-val${callout ? ' bump' : ''}`}>₩{val}</b></div>
      </div>
      <div className={`d-callout${callout ? ' show' : ''}`}>표기 1,350원 → 볶으면 <b>+25%</b> · 수율이 만든 진짜 원가</div>
    </div>
  )
}

const SLIDE = [
  { p: 9000, m: 41, be: 66 },
  { p: 9500, m: 43, be: 59 },
  { p: 8500, m: 38, be: 75 },
]
function ResultMini({ active, playId }) {
  const [idx, setIdx] = useState(0)
  const cost = Math.round(useCountUp(5310, active, { dur: 800, playId }))
  const cur = SLIDE[idx]
  const marginC = Math.round(useCountUp(cur.m, active, { dur: 600, playId: playId * 10 + idx }))
  const beC = Math.round(useCountUp(cur.be, active, { dur: 600, playId: playId * 10 + idx + 3 }))
  useEffect(() => {
    if (!active) { setIdx(0); return }
    if (reducedMotion()) { setIdx(0); return }
    setIdx(0)
    const t1 = setTimeout(() => setIdx(1), 1400)
    const t2 = setTimeout(() => setIdx(2), 3000)
    const t3 = setTimeout(() => setIdx(0), 4600)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [active, playId])
  const pct = ((cur.p - 4860) / (16200 - 4860)) * 100
  return (
    <div className="d-result">
      <div className="d-rcards">
        <div className="d-rcard"><span className="l">1그릇 실원가</span><b className="num">₩{won(cost)}</b></div>
        <div className="d-rcard ink"><span className="l">{won(cur.p)}원에 팔면</span><b className="num accent">마진 {marginC}%</b></div>
        <div className="d-rcard"><span className="l">이 메뉴로 본전</span><b className="num">{beC}<i>그릇</i></b></div>
      </div>
      <div className="d-tip"><span className="dot gb" /><p>마진이 <b>건강해요</b>. 이 가격, 자신 있게 받으셔도 됩니다.</p></div>
      <div className="d-slider">
        <div className="d-slider-top"><span>판매가</span><b className="num">{won(cur.p)}원</b></div>
        <div className="d-track"><span className="d-fill" style={{ width: `${pct}%` }} /><span className="d-thumb" style={{ left: `${pct}%` }} /></div>
      </div>
    </div>
  )
}

const BEATS = [
  { k: '내 메뉴판', h: '오늘, 몇 그릇 팔면\n본전일까요?', p: '하루 고정비 243,000원 ÷ 메뉴 평균 2,730원 = 90그릇. 고정비를 바꾸면 오늘 목표 그릇 수가 바로 다시 계산돼요.', Cmp: HomeMini, cls: 'scr-menu' },
  { k: '이렇게 담아요', h: '마켓처럼 담으면\n담는 순간 계산돼요', p: '식자재를 장바구니에 담을 때마다 예상 마진이 바로 움직여요. 담기 한 번에 52% → 50%, 진짜로 계산되는 거예요.', Cmp: MarketMini, cls: 'scr-market' },
  { k: '우리가 다른 점', h: "원물 단가가 아니라\n'조리 후' 진짜 원가", p: '앞다리살 150g을 볶으면 120g만 남아요(수율 80%). 실제 원가는 표기 단가보다 25% 비싸집니다. 그 차이를 계산에 넣는 게 핵심이에요.', Cmp: CartMini, cls: 'scr-cart' },
  { k: '결과 한 장', h: '한 그릇의 진짜 원가부터\n오늘 본전 그릇 수까지', p: '1그릇 실원가 ₩5,310 · 마진 41% · 본전 66그릇. 판매가를 밀면 마진과 본전 그릇 수가 실시간으로 바뀌어요.', Cmp: ResultMini, cls: 'scr-result' },
]

export function StorySection({ onEnter }) {
  const [active, setActive] = useState(0)
  const [playId, setPlayId] = useState(0)
  const beatRefs = useRef([])
  const storyRef = useRef(null)
  useEffect(() => {
    // 스크롤에 따라 화면 중앙에 온 beat를 active로 (컴포지터 기반 — rAF/scroll 이벤트 불필요)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.i)) }),
      { rootMargin: '-48% 0px -48% 0px', threshold: 0 }
    )
    const els = beatRefs.current.filter(Boolean)
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  useEffect(() => { setPlayId((p) => p + 1) }, [active])

  const captions = ['고정비를 바꾸면 목표 그릇 수가 다시 계산돼요', '담는 순간 예상 마진이 움직여요', '조리법만 바꿔도 수율이 원가를 바꿔요', '판매가를 밀면 본전 그릇 수가 실시간으로']

  return (
    <section className="story" ref={storyRef}>
      <div className="story-stage">
        <div className="story-stage-in">
          <div className="story-copy">
            <div className="story-progress">
              {BEATS.map((_, i) => <span key={i} className={`sp-dot${i === active ? ' on' : i < active ? ' done' : ''}`} />)}
            </div>
            {BEATS.map((b, i) => (
              <div className={`beat-copy${i === active ? ' on' : ''}`} key={i} aria-hidden={i !== active}>
                <div className="beat-kicker">{b.k}</div>
                <h2>{b.h.split('\n').map((l, j) => <span key={j}>{l}<br /></span>)}</h2>
                <p>{b.p}</p>
                <div className="story-caption">{captions[i]}</div>
              </div>
            ))}
          </div>
          <div className="story-phone">
            <div className="demo-phone" aria-label="앱 화면이 스크롤에 따라 순서대로 작동하는 데모">
              <div className={`demo-screen ${BEATS[active].cls}`}>
                <StatusBar />
                <div className="story-screens">
                  {BEATS.map((b, i) => {
                    const Cmp = b.Cmp
                    return (
                      <div className={`story-layer${i === active ? ' on' : i < active ? ' past' : ''}`} key={i} aria-hidden="true">
                        <Cmp active={i === active} playId={playId} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="story-spacers">
        {BEATS.map((_, i) => <div className="beat-spacer" data-i={i} key={i} ref={(el) => (beatRefs.current[i] = el)} />)}
      </div>
    </section>
  )
}

/* =========================================================
   대시보드 데모 (정적 섹션, 진입 시 1회 재생)
   ========================================================= */
export function DashDemo() {
  const [ref, inView] = useInView(0.4)
  const ranks = [
    { nm: '제육덮밥', m: 41, s: 'g' }, { nm: '김치찌개', m: 41, s: 'g' },
    { nm: '돈까스', m: 35, s: 'g' }, { nm: '마라탕', m: 24, s: 'w' }, { nm: '물냉면', m: 12, s: 'b' },
  ]
  const R = 34, C = 2 * Math.PI * R
  const good = 60 // 3/5
  return (
    <div className="demo-phone wide" ref={ref} aria-label="메뉴별 마진 순위와 건강도 대시보드">
      <div className="demo-screen scr-dash">
        <StatusBar />
        <div className="d-dash-title">대시보드</div>
        <div className="d-panel">
          <div className="d-panel-h">메뉴 마진 순위</div>
          {ranks.map((r, i) => (
            <div className="d-rankrow" key={r.nm}>
              <span className="d-rk num">{i + 1}</span><span className="d-rnm">{r.nm}</span>
              <span className="d-rtrack"><span className={`${r.s}b`} style={{ width: inView ? `${r.m}%` : '0%', transitionDelay: `${i * 0.08}s` }} /></span>
              <b className={`d-rpct num ${r.s}`}>{r.m}%</b>
            </div>
          ))}
        </div>
        <div className="d-panel">
          <div className="d-panel-h">마진 건강도</div>
          <div className="d-donut-wrap">
            <svg width="92" height="92" viewBox="0 0 92 92" className="d-donut">
              <circle cx="46" cy="46" r={R} fill="none" stroke="var(--track)" strokeWidth="11" />
              <circle cx="46" cy="46" r={R} fill="none" stroke="var(--good-1)" strokeWidth="11" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={inView ? C * (1 - good / 100) : C} transform="rotate(-90 46 46)" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.8,.3,1)' }} />
            </svg>
            <div className="d-legend">
              <span><i className="gb" />건강 30% 이상 <b className="num">3개</b></span>
              <span><i className="wb" />주의 20~29% <b className="num">1개</b></span>
              <span><i className="bb" />위험 20% 미만 <b className="num">1개</b></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
