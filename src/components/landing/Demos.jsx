import { useState, useEffect, useRef } from 'react'
import Icon, { TrendTri } from '../Icon'
import { useCountUp, useTween, reducedMotion } from './hooks'

const won = (n) => Math.round(n).toLocaleString('ko-KR')

/* iOS 상태바 (앱과 동일) */
function StatusBar() {
  return (
    <div className="statusbar">
      <span className="num">9:41</span>
      <div className="sb-right">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M1 4.2C3.2 2.4 5.7 1.4 8.5 1.4S13.8 2.4 16 4.2" /><path d="M3.6 6.9c1.4-1.1 3.1-1.7 4.9-1.7s3.5.6 4.9 1.7" /><path d="M6.2 9.5c.7-.5 1.5-.8 2.3-.8s1.6.3 2.3.8" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="21" height="10" rx="3" stroke="currentColor" strokeWidth="1.2" opacity=".5" /><rect x="2.8" y="2.8" width="15" height="6.4" rx="1.6" fill="currentColor" /><rect x="23" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".5" /></svg>
      </div>
    </div>
  )
}

/* 정석 iOS 폰 프레임: 다이나믹 아일랜드 + 홈 인디케이터 + 실제 앱 화면(392px)을 그대로 스케일다운 */
function IosPhone({ children, className = '', label }) {
  return (
    <div className={`ios-phone ${className}`} aria-label={label} role="img">
      <div className="ios-screen">
        <div className="ios-scaler">{children}</div>
        <div className="ios-island" />
        <div className="ios-home" />
      </div>
    </div>
  )
}

function TapRing({ show, style }) {
  return <span className={`tapring${show ? ' on' : ''}`} style={style} aria-hidden="true" />
}

/* =========================================================
   히어로 — 식자재 마트 '담기 마법' 무한 루프
   ========================================================= */
export function HeroPhone() {
  const base = { n: 3, food: '1,790', m: 52, onion: false, samgyup: false, tap: null, toast: null }
  const [s, setS] = useState(base)
  useEffect(() => {
    if (reducedMotion()) { setS({ ...base, n: 4, food: '1,910', m: 51, onion: true }); return }
    let timers = []; let cancelled = false
    const at = (d, fn) => timers.push(setTimeout(fn, d))
    const run = () => {
      if (cancelled) return
      setS(base)
      at(900, () => setS(v => ({ ...v, tap: 'onion' })))
      at(1450, () => setS(v => ({ ...v, onion: true, n: 4, food: '1,910', m: 51, tap: null, toast: '양파 담았어요 · 마진 52% → 51%' })))
      at(3600, () => setS(v => ({ ...v, toast: null })))
      at(4100, () => setS(v => ({ ...v, tap: 'samgyup' })))
      at(4650, () => setS(v => ({ ...v, samgyup: true, n: 5, food: '3,350', m: 49, tap: null, toast: '삼겹살 담았어요 · 마진 51% → 49%' })))
      at(6800, () => setS(v => ({ ...v, toast: null })))
      at(7800, run)
    }
    run()
    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [])

  const pop = [
    { id: 'samgyup', nm: '삼겹살', pr: '12,000', unit: '/kg', img: '/img/samgyup.webp', in: s.samgyup },
    { id: 'onion', nm: '양파', pr: '2,000', unit: '/kg', img: '/img/onion.webp', in: s.onion },
    { id: 'egg', nm: '계란', pr: '6,000', unit: '/30구', img: '/img/egg.webp', in: false },
  ]
  return (
    <IosPhone label="식자재 마트에서 재료를 담으면 예상 마진이 실시간으로 바뀌는 화면">
      <div className="app-clone scr-market">
        <StatusBar />
        <div className="mkt-head">
          <div className="mh-top"><button className="iconbtn"><Icon name="back" size={22} stroke={2} /></button><span className="mh-title">재료 담기</span></div>
          <button className="chip"><span className="chip-ic"><img src="/img/dish_jeyuk.webp" alt="" /></span><span className="chip-tx"><b>제육덮밥</b><span>담는 중</span></span><Icon name="chevD" size={16} stroke={2} className="cd" /></button>
          <div className="search"><Icon name="search" size={18} stroke={2} /><input placeholder="삼겹살, 양파, 고추장…" readOnly /></div>
        </div>
        <div className="catbar"><div className="cats">{['전체', '정육', '수산', '청과', '양념'].map((c, i) => <button key={c} className={`cat${i === 0 ? ' on' : ''}`}>{c}</button>)}</div></div>
        <div className="sec-head"><h2>사장님이 많이 담아요</h2><span className="more">더보기 ›</span></div>
        <div className="hscroll" style={{ position: 'relative' }}>
          {pop.map((p) => (
            <div className="hcard" key={p.id}>
              <div className="himg" style={{ background: 'var(--tile)' }}>
                <img src={p.img} alt={p.nm} />
                <button className={`add${p.in ? ' in' : ''}`}><Icon name={p.in ? 'check' : 'plus'} size={19} stroke={2.4} /></button>
              </div>
              <div className="hcard-tx"><div className="nm">{p.nm}</div><div className="pr num">{p.pr}원<i>{p.unit}</i></div></div>
            </div>
          ))}
          <TapRing show={s.tap === 'samgyup'} style={{ left: 78, top: 100 }} />
          <TapRing show={s.tap === 'onion'} style={{ left: 234, top: 100 }} />
        </div>
        <div className="vsec"><div className="sec-head"><h2>정육</h2></div>
          <div className="vlist">
            {[['삼겹살', '12,000', '/img/samgyup.webp', '3% 저렴'], ['앞다리살', '9,000', '/img/apdari.webp', '1% 저렴'], ['목살', '11,500', '/img/moksal.webp', '보통']].map(([nm, pr, img, t], i) => (
              <div className="vitem" key={nm}>
                <div className="vthumb" style={{ background: 'var(--tile)' }}><img src={img} alt={nm} /></div>
                <div className="vmid"><div className="nm">{nm}</div><div className="pr num">{pr}원<i>/kg</i></div><span className={`trend ${t === '보통' ? 'fl' : 'dn'}`}>{t === '보통' ? '시세 보통' : <><TrendTri dir="dn" />{t}</>}</span></div>
                <button className="addv"><Icon name="plus" size={20} stroke={2.4} /></button>
              </div>
            ))}
          </div>
        </div>
        <button className="cartbar">
          <div className="cb-left">
            <span className="cb-cart"><Icon name="cart" size={20} stroke={1.8} /><span className="cb-badge num">{s.n}</span></span>
            <span className="cb-tx"><span className="l1">장바구니 {s.n}개</span><span className="l2 num">식자재 {s.food}원</span></span>
          </div>
          <div className="cb-right"><span className="cb-margin"><span>예상 마진</span><b className="num">{s.m}%</b></span><Icon name="chevR" size={18} stroke={2.2} className="cr" /></div>
        </button>
        <div className={`toast${s.toast ? ' show' : ''}`}>{s.toast || ''}</div>
      </div>
    </IosPhone>
  )
}

/* =========================================================
   스토리 미니 화면 (실제 앱 클론)
   ========================================================= */
const HOME_MENUS = [
  { nm: '제육덮밥', pr: '9,000', prof: '3,690', m: 41, s: 'g', img: '/img/dish_jeyuk.webp', badge: '방금 계산' },
  { nm: '김치찌개', pr: '8,000', prof: '3,280', m: 41, s: 'g', img: '/img/dish_kimchi.webp' },
  { nm: '돈까스', pr: '9,500', prof: '3,325', m: 35, s: 'g', img: '/img/dish_donkkaseu.webp' },
  { nm: '마라탕', pr: '9,000', prof: '2,160', m: 24, s: 'w', img: '/img/dish_mala.webp' },
]
function MenuClone({ active, playId }) {
  const [bump, setBump] = useState(false)
  const bowls = Math.round(useTween(active ? (bump ? 99 : 90) : 0, active, { dur: 900 }))
  useEffect(() => {
    if (!active || reducedMotion()) { setBump(false); return }
    setBump(false)
    const t = setTimeout(() => setBump(true), 2200)
    return () => clearTimeout(t)
  }, [active, playId])
  return (
    <div className="app-clone scr-menu">
      <StatusBar />
      <div className="hd">
        <div className="hd-brand"><div className="logo-img"><img src="/img/logo.webp" alt="" /></div><span className="hd-wordmark">오늘 몇 그릇?</span></div>
        <div className="hd-row"><h1 className="hd-title">내 메뉴판</h1><span className="hd-count num">메뉴 5 · 효자 제육덮밥</span></div>
      </div>
      <div className="hero">
        <div className="hero-label">오늘 본전을 맞추려면 · 가게 평균 기준</div>
        <div className="hero-num"><b className="num">{bowls}</b><span className="unit">그릇</span><span className="tail">정도 팔면 돼요</span></div>
        <hr className="hero-rule" />
        <div className="hero-calc"><span>하루 고정비 <b className="num">{bump ? '270,000' : '243,000'}원</b> ÷ 메뉴 평균 <b className="num">2,730원</b></span><button className="hero-edit">고정비 수정</button></div>
      </div>
      <div className="legend-row">
        <span className="lg-item"><i className="dot g-bg" />건강 30% 이상</span>
        <span className="lg-item"><i className="dot w-bg" />주의 20~29%</span>
        <span className="lg-item"><i className="dot b-bg" />위험 20% 미만</span>
      </div>
      <div className="menu-sec-head"><h2>내 메뉴</h2><button className="sort-btn">마진 높은 순 <Icon name="chevD" size={14} stroke={2} /></button></div>
      <div className="list">
        {HOME_MENUS.map((m, i) => (
          <div className="mcard" key={m.nm}>
            <div className="mcard-photo"><img src={m.img} alt={m.nm} /></div>
            <div className="mcard-body">
              <div className="mcard-name"><h3>{m.nm}</h3>{m.badge && <span className="badge">{m.badge}</span>}</div>
              <div className="mcard-sub"><span className="num">{m.pr}원</span><span className="mcard-dot">·</span><span className="mcard-profit num">그릇당 <b className={m.s}>+{m.prof}원</b></span></div>
              <div className="bar"><span className={`${m.s}-bg`} style={{ width: active ? `${m.m}%` : '0%', transition: 'width .8s cubic-bezier(.2,.8,.3,1)', transitionDelay: `${0.25 + i * 0.1}s` }} /></div>
            </div>
            <div className="mcard-end"><div className="mcard-pct"><span className={`dot ${m.s}-bg`} /><b className={`num ${m.s}`}>{m.m}%</b></div><Icon name="chevR" size={16} stroke={2} className="chev" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MarketClone({ active, playId }) {
  const [added, setAdded] = useState(false)
  const [tap, setTap] = useState(false)
  const [bar, setBar] = useState(false)
  const [m, setM] = useState(52)
  useEffect(() => {
    if (!active) { setAdded(false); setTap(false); setBar(false); setM(52); return }
    if (reducedMotion()) { setAdded(true); setBar(true); setM(50); return }
    setAdded(false); setBar(false); setM(52)
    const t1 = setTimeout(() => setTap(true), 900)
    const t2 = setTimeout(() => { setTap(false); setAdded(true); setBar(true) }, 1450)
    const t3 = setTimeout(() => setM(50), 1900)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [active, playId])
  const pop = [['삼겹살', '/img/samgyup.webp'], ['양파', '/img/onion.webp'], ['계란', '/img/egg.webp'], ['대파', '/img/daepa.webp'], ['고추장', '/img/gochu.webp']]
  const rows = [
    { nm: '삼겹살', pr: '12,000', unit: '/kg', img: '/img/samgyup.webp', t: '3% 저렴' },
    { nm: '앞다리살', pr: '9,000', unit: '/kg', img: '/img/apdari.webp', t: '1% 저렴' },
  ]
  return (
    <div className="app-clone scr-market">
      <StatusBar />
      <div className="mkt-head">
        <div className="mh-top"><button className="iconbtn"><Icon name="back" size={22} stroke={2} /></button><span className="mh-title">재료 담기</span></div>
        <button className="chip"><span className="chip-ic"><img src="/img/dish_jeyuk.webp" alt="" /></span><span className="chip-tx"><b>제육덮밥</b><span>담는 중</span></span><Icon name="chevD" size={16} stroke={2} className="cd" /></button>
        <div className="search"><Icon name="search" size={18} stroke={2} /><input placeholder="삼겹살, 양파, 고추장…" readOnly /></div>
      </div>
      <div className="catbar"><div className="cats">{['전체', '정육', '수산', '청과', '양념'].map((c, i) => <button key={c} className={`cat${i === 0 ? ' on' : ''}`}>{c}</button>)}</div></div>
      <div className="sec-head"><h2>사장님이 많이 담아요</h2><span className="more">더보기 ›</span></div>
      <div className="hscroll"><div className={`hscroll-row${active ? ' run' : ''}`}>
        {pop.map(([nm, img]) => (
          <div className="hcard" key={nm}><div className="himg" style={{ background: 'var(--tile)' }}><img src={img} alt={nm} /></div><div className="hcard-tx"><div className="nm">{nm}</div></div></div>
        ))}
      </div></div>
      <div className="vsec"><div className="sec-head"><h2>정육</h2></div>
        <div className="vlist">
          {rows.map((r, i) => (
            <div className="vitem" key={r.nm} style={{ position: 'relative' }}>
              <div className="vthumb" style={{ background: 'var(--tile)' }}><img src={r.img} alt={r.nm} /></div>
              <div className="vmid"><div className="nm">{r.nm}</div><div className="pr num">{r.pr}원<i>{r.unit}</i></div><span className="trend dn"><TrendTri dir="dn" />{r.t}</span></div>
              <button className={`addv${i === 0 && added ? ' in' : ''}`}><Icon name={i === 0 && added ? 'check' : 'plus'} size={20} stroke={2.4} /></button>
              {i === 0 && <TapRing show={tap} style={{ right: 22, top: 30 }} />}
            </div>
          ))}
        </div>
      </div>
      <button className={`cartbar${bar ? '' : ' hide'}`}>
        <div className="cb-left"><span className="cb-cart"><Icon name="cart" size={20} stroke={1.8} /><span className="cb-badge num">2</span></span><span className="cb-tx"><span className="l1">장바구니 2개</span><span className="l2 num">식자재 1,790원</span></span></div>
        <div className="cb-right"><span className="cb-margin"><span>예상 마진</span><b className="num">{m}%</b></span><Icon name="chevR" size={18} stroke={2.2} className="cr" /></div>
      </button>
    </div>
  )
}

function CartClone({ active, playId }) {
  const [fry, setFry] = useState(false)
  const [callout, setCallout] = useState(false)
  const margin = Math.round(useTween(active ? (fry ? 40 : 41) : 0, active, { dur: 650 }))
  useEffect(() => {
    if (!active || reducedMotion()) { setFry(false); setCallout(false); return }
    setFry(false); setCallout(false)
    const t1 = setTimeout(() => { setFry(true); setCallout(true) }, 1400)
    const t2 = setTimeout(() => setCallout(false), 3300)
    const t3 = setTimeout(() => setFry(false), 3500)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [active, playId])
  const cost = fry ? '5,420' : '5,310'
  const profit = fry ? '3,580' : '3,690'
  const yld = fry ? 75 : 80
  const val = fry ? '1,800' : '1,688'
  const cooks = ['생', '볶기', '삶기', '튀김']
  const cur = fry ? '튀김' : '볶기'
  return (
    <div className="app-clone scr-cart paper2">
      <StatusBar />
      <div className="hd"><div className="hd-top"><button className="iconbtn"><Icon name="back" size={22} stroke={2} /></button><h1>장바구니</h1></div><p className="sub">제육덮밥 담는 중 · 재료를 넣으면 마진이 계산돼요</p></div>
      <div className="sum">
        <div className="sum-top"><div className="m">제육덮밥 · 판매가 <b className="num">9,000원</b></div><button className="edit">판매가 조정 ›</button></div>
        <div className="sum-mid">
          <div className="sum-margin"><span className="lab">예상 마진</span><b className="num g">{margin}%</b></div>
          <div className="sum-stats"><div className="row">1인분 원가<b className="num">{cost}원</b></div><div className="row">한 그릇 남는 돈<b className="num">{profit}원</b></div></div>
        </div>
        <div className="mbar"><span className="gb" style={{ width: active ? `${margin}%` : '0%' }} /></div>
      </div>
      <div className="sec-head"><h2>담은 재료</h2><span className="cnt">5개</span></div>
      <div className="ings">
        <div className="ing">
          <div className="ing-top">
            <div className="vthumb" style={{ background: 'var(--tile)' }}><img src="/img/apdari.webp" alt="앞다리살" /></div>
            <div className="ing-name"><b>앞다리살</b><span>9원/g</span></div>
            <div className="ing-cost"><span className="yld">수율 {yld}%</span><div className={`val num${callout ? ' bump' : ''}`}>₩{val}</div></div>
          </div>
          <div className="ctrl"><span className="ctrl-lab">사용량</span><div className="stepper"><button><Icon name="minus" size={16} stroke={2.4} /></button><span className="v num">150<i>g</i></span><button><Icon name="plus" size={16} stroke={2.4} /></button></div></div>
          <div className="ctrl" style={{ position: 'relative' }}>
            <span className="ctrl-lab">조리</span>
            <div className="cooks">{cooks.map((c) => <button key={c} className={`cook${c === cur ? ' on' : ''}`}>{c}</button>)}</div>
            <TapRing show={callout} style={{ right: 24, top: 20 }} />
          </div>
        </div>
      </div>
      <div className={`yield-callout${callout ? ' show' : ''}`}>표기 1,350원 → 볶으면 <b>+25%</b> · 수율이 만든 진짜 원가</div>
    </div>
  )
}

const STEPS = [9000, 9500, 8500, 9000]
function ResultClone({ active, playId }) {
  const [idx, setIdx] = useState(0)
  const price = Math.round(useTween(active ? STEPS[idx] : 9000, active, { dur: 1000 }) / 10) * 10
  useEffect(() => {
    if (!active || reducedMotion()) { setIdx(0); return }
    setIdx(0)
    const t1 = setTimeout(() => setIdx(1), 1400)
    const t2 = setTimeout(() => setIdx(2), 3200)
    const t3 = setTimeout(() => setIdx(3), 5000)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [active, playId])
  const overhead = 1670 + Math.round(price * 0.12)
  const cost = 2558 + overhead
  const profit = price - cost
  const margin = Math.round((profit / price) * 100)
  const be = profit > 0 ? Math.ceil(243000 / profit) : '—'
  const pct = ((price - 4860) / (16200 - 4860)) * 100
  return (
    <div className="app-clone scr-result paper2">
      <StatusBar />
      <div className="hd"><div className="hd-top"><button className="iconbtn"><Icon name="back" size={22} stroke={2} /></button><h1>마진 결과</h1></div><p className="sub">제육덮밥 원가와 마진이에요</p></div>
      <div className="cards">
        <div className="rcard"><div className="lab">1그릇 실원가</div><div className="big"><b className="num">₩{won(Math.round(cost / 10) * 10)}</b></div></div>
        <div className="rcard ledger"><div className="lab">{won(price)}원에 팔면</div><div className="big"><b className="num" style={{ color: '#5FD6A0' }}>마진 {margin}%</b></div><hr className="line" /><div className="row"><span>1인분 원가</span><b className="num">{won(Math.round(cost / 10) * 10)}원</b></div><div className="row"><span>한 그릇 남는 돈</span><b className="num accent">{won(Math.round(profit / 10) * 10)}원</b></div></div>
        <div className="rcard"><div className="lab">이 메뉴로 본전 맞추기</div><div className="big"><b className="num">{be}</b><span className="unit">그릇</span><span className="sub">팔면 본전</span></div></div>
      </div>
      <div className="slider">
        <div className="slider-top"><span className="lab">판매가를 조정해 보세요</span><span className="price num">{won(price)}원</span></div>
        <div className="fake-range"><span className="fr-fill" style={{ width: `${pct}%` }} /><span className="fr-thumb" style={{ left: `${pct}%` }} /></div>
        <div className="slider-res">
          <div className="item"><div className="k">마진</div><div className="v num g">{margin}%</div></div>
          <div className="item"><div className="k">한 그릇 남는 돈</div><div className="v num">{won(Math.round(profit / 10) * 10)}</div></div>
          <div className="item"><div className="k">손익분기</div><div className="v num">{be}그릇</div></div>
        </div>
      </div>
    </div>
  )
}

const BEATS = [
  { k: '01 · 내 메뉴판', g: '90', h: '오늘, 몇 그릇 팔면\n본전일까요?', p: '하루 고정비 243,000원 ÷ 메뉴 평균 2,730원 = 90그릇. 고정비를 바꾸면 오늘 목표 그릇 수가 바로 다시 계산돼요.', Cmp: MenuClone, cls: 'scr-menu', cap: '고정비를 바꾸면 목표 그릇 수가 다시 계산돼요' },
  { k: '02 · 이렇게 담아요', g: '52%', h: '마켓처럼 담으면\n담는 순간 계산돼요', p: '식자재를 장바구니에 담을 때마다 예상 마진이 바로 움직여요. 담기 한 번에 52% → 50%, 진짜로 계산되는 거예요.', Cmp: MarketClone, cls: 'scr-market', cap: '담는 순간 예상 마진이 움직여요' },
  { k: '03 · 우리가 다른 점', g: '80%', h: "원물 단가가 아니라\n'조리 후' 진짜 원가", p: '앞다리살 150g을 볶으면 120g만 남아요(수율 80%). 실제 원가는 표기 단가보다 25% 비싸집니다. 그 차이를 계산에 넣는 게 핵심이에요.', Cmp: CartClone, cls: 'scr-cart', cap: '조리법만 바꿔도 수율이 원가를 바꿔요' },
  { k: '04 · 결과 한 장', g: '66', h: '한 그릇의 진짜 원가부터\n오늘 본전 그릇 수까지', p: '1그릇 실원가 ₩5,310 · 마진 41% · 본전 66그릇. 판매가를 밀면 마진과 본전 그릇 수가 실시간으로 바뀌어요.', Cmp: ResultClone, cls: 'scr-result', cap: '판매가를 밀면 본전 그릇 수가 실시간으로' },
]

export function StorySection() {
  const [active, setActive] = useState(0)
  const [playId, setPlayId] = useState(0)
  const beatRefs = useRef([])
  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight / 2
      let best = 0, bestDist = Infinity
      beatRefs.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - mid)
        if (d < bestDist) { bestDist = d; best = i }
      })
      setActive((prev) => (prev === best ? prev : best))
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    const io = new IntersectionObserver(() => update(), { rootMargin: '-35% 0px -35% 0px', threshold: [0, 0.5, 1] })
    beatRefs.current.forEach((el) => el && io.observe(el))
    update()
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); io.disconnect() }
  }, [])
  useEffect(() => { setPlayId((p) => p + 1) }, [active])

  return (
    <section className="story">
      <div className="story-stage">
        <div className="story-stage-in">
          <div className="story-ghost num" aria-hidden="true" key={active}>{BEATS[active].g}</div>
          <div className="story-copy">
            <div className="story-progress">{BEATS.map((_, i) => <span key={i} className={`sp-dot${i === active ? ' on' : i < active ? ' done' : ''}`} />)}</div>
            {BEATS.map((b, i) => (
              <div className={`beat-copy${i === active ? ' on' : ''}`} key={i} aria-hidden={i !== active}>
                <div className="beat-kicker">{b.k}</div>
                <h2>{b.h.split('\n').map((l, j) => <span key={j}>{l}<br /></span>)}</h2>
                <p>{b.p}</p>
                <div className="story-caption">{b.cap}</div>
              </div>
            ))}
          </div>
          <div className="story-phone">
            <IosPhone label="앱 화면이 스크롤에 따라 순서대로 작동하는 데모">
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
            </IosPhone>
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
   대시보드 데모 (실제 앱 클론, 진입 시 1회 재생)
   ========================================================= */
export function DashDemo() {
  const [on, setOn] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.4 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const ranks = [
    { nm: '제육덮밥', m: 41, s: 'g' }, { nm: '김치찌개', m: 41, s: 'g' }, { nm: '돈까스', m: 35, s: 'g' }, { nm: '마라탕', m: 24, s: 'w' }, { nm: '물냉면', m: 12, s: 'b' },
  ]
  const R = 34, C = 2 * Math.PI * R
  return (
    <div ref={ref}>
      <IosPhone className="wide" label="메뉴별 마진 순위와 건강도 대시보드">
        <div className="app-clone scr-dash scr-tabpage">
          <StatusBar />
          <div className="hd"><h1 className="hd-title">대시보드</h1><p className="hd-desc">가게 전체 마진을 한눈에</p></div>
          <div className="be">
            <div className="lab">하루 고정비 ÷ 메뉴 평균 2,730원 · 가게 전체 기준</div>
            <div className="big"><b className="num">90</b><span className="unit">그릇</span></div>
          </div>
          <div className="panel">
            <h2>메뉴 마진 순위</h2>
            <div className="ph">효자 메뉴부터 적자 메뉴까지</div>
            {ranks.map((r, i) => (
              <div className="rankrow" key={r.nm}>
                <span className="rk num">{i + 1}</span><span className="nm">{r.nm}</span>
                <span className="track"><span className={`${r.s}-bg`} style={{ width: on ? `${r.m}%` : '0%', transition: 'width .7s cubic-bezier(.2,.8,.3,1)', transitionDelay: `${i * 0.08}s` }} /></span>
                <span className={`pc num ${r.s}`}>{r.m}%</span>
              </div>
            ))}
          </div>
          <div className="panel">
            <h2>마진 건강도</h2>
            <div className="ph">메뉴 5개 분포</div>
            <div className="donut-wrap">
              <div style={{ width: 108, height: 108, position: 'relative', flex: '0 0 auto' }}>
                <svg width="108" height="108" viewBox="0 0 108 108">
                  <circle cx="54" cy="54" r={R} fill="none" stroke="var(--track)" strokeWidth="12" />
                  <circle cx="54" cy="54" r={R} fill="none" stroke="var(--good-1)" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={on ? C * 0.4 : C} transform="rotate(-90 54 54)" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.8,.3,1)' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <b style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.5px' }} className="num">60%</b><span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--muted)' }}>건강</span>
                </div>
              </div>
              <div className="legend">
                <div className="lg"><i style={{ background: '#16A06A' }} />건강 30% 이상<span className="num">3개</span></div>
                <div className="lg"><i style={{ background: '#D69412' }} />주의 20~29%<span className="num">1개</span></div>
                <div className="lg"><i style={{ background: '#D04B3F' }} />위험 20% 미만<span className="num">1개</span></div>
              </div>
            </div>
          </div>
        </div>
      </IosPhone>
    </div>
  )
}
