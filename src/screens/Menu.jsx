import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import { useStore } from '../state/store'
import { won, round10, sig, breakeven } from '../lib/calc'

const PRESETS = [150000, 200000, 250000, 300000]

export default function Menu() {
  const nav = useNavigate()
  const { menus, dailyFixed, setDailyFixed, loadMenu } = useStore()
  const [editFixed, setEditFixed] = useState(false)
  const [sortHigh, setSortHigh] = useState(true)

  const profitOf = (m) => (m.price * m.margin) / 100
  const avgProfit = round10(menus.reduce((a, m) => a + profitOf(m), 0) / menus.length)
  const bowls = breakeven(avgProfit, dailyFixed)
  const best = menus.reduce((a, b) => (b.margin > a.margin ? b : a))
  const healthy = menus.filter((m) => m.margin >= 30).length
  const sorted = [...menus].sort((a, b) => (sortHigh ? b.margin - a.margin : a.margin - b.margin))

  const openMenu = (m) => { loadMenu(m); nav('/app/result') }

  return (
    <div className="scroll">
      {/* 브랜드 헤더 */}
      <div className="hd fade">
        <div className="hd-brand">
          <div className="logo-img"><Photo src="/img/logo.webp" icon="bowl" iconSize={17} /></div>
          <span className="hd-wordmark">오늘 몇 그릇?</span>
        </div>
        <div className="hd-row">
          <h1 className="hd-title">내 메뉴판</h1>
          <span className="hd-count num">메뉴 {menus.length} · 효자 {best.nm}</span>
        </div>
      </div>

      {/* 본전 카드 — 계산식을 그대로 보여주고, 고정비를 직접 조절 */}
      <div className="hero fade" style={{ animationDelay: '.05s' }}>
        <div className="hero-label">오늘 본전을 맞추려면 · 가게 평균 기준</div>
        <div className="hero-num">
          <b className="num">{bowls === Infinity ? '—' : bowls}</b><span className="unit">그릇</span><span className="tail">정도 팔면 돼요</span>
        </div>
        <hr className="hero-rule" />
        <div className="hero-calc">
          <span>하루 고정비 <b className="num">{won(dailyFixed)}원</b> ÷ 메뉴 평균 <b className="num">{won(avgProfit)}원</b></span>
          <button className="hero-edit" onClick={() => setEditFixed((v) => !v)}>{editFixed ? '닫기' : '고정비 수정'}</button>
        </div>
        {editFixed && (
          <div className="hero-editor">
            <div className="fx-stepper">
              <button onClick={() => setDailyFixed(Math.max(50000, dailyFixed - 10000))} aria-label="감소"><Icon name="minus" size={16} stroke={2.4} /></button>
              <span className="num">{won(dailyFixed)}원</span>
              <button onClick={() => setDailyFixed(dailyFixed + 10000)} aria-label="증가"><Icon name="plus" size={16} stroke={2.4} /></button>
            </div>
            <div className="fx-presets">
              {PRESETS.map((p) => (
                <button key={p} className={`fx-preset${dailyFixed === p ? ' on' : ''}`} onClick={() => setDailyFixed(p)}>{won(p / 10000)}만</button>
              ))}
            </div>
            <p className="fx-hint">월세·인건비·공과금 등 하루 나가는 돈을 넣어요. 본전 그릇 수가 바로 바뀝니다.</p>
          </div>
        )}
      </div>

      {/* 신호등 범례 */}
      <div className="legend-row fade" style={{ animationDelay: '.08s' }}>
        <span className="lg-item"><i className="dot g-bg" />건강 30% 이상</span>
        <span className="lg-item"><i className="dot w-bg" />주의 20~29%</span>
        <span className="lg-item"><i className="dot b-bg" />위험 20% 미만</span>
      </div>

      {/* 메뉴 리스트 */}
      <div className="menu-sec-head">
        <h2>내 메뉴</h2>
        <button className="sort-btn" onClick={() => setSortHigh((v) => !v)}>
          {sortHigh ? '마진 높은 순' : '마진 낮은 순'}
          <Icon name="chevD" size={14} stroke={2} />
        </button>
      </div>

      <div className="list">
        {sorted.map((m, i) => {
          const s = sig(m.margin)
          const profit = round10(profitOf(m))
          return (
            <div key={m.id} className="mcard fade" style={{ animationDelay: `${0.1 + i * 0.04}s` }} onClick={() => openMenu(m)}>
              <div className="mcard-photo"><Photo src={m.img} icon={m.icon} iconSize={30} alt={m.nm} /></div>
              <div className="mcard-body">
                <div className="mcard-name">
                  <h3>{m.nm}</h3>
                  {m.badge && <span className="badge">{m.badge}</span>}
                </div>
                <div className="mcard-sub">
                  <span className="num">{won(m.price)}원</span>
                  <span className="mcard-dot">·</span>
                  <span className="mcard-profit num">그릇당 <b className={s}>+{won(profit)}원</b></span>
                </div>
                <div className="bar"><span className={`${s}-bg`} style={{ width: `${Math.max(4, Math.min(100, m.margin))}%` }} /></div>
              </div>
              <div className="mcard-end">
                <div className="mcard-pct"><span className={`dot ${s}-bg`} /><b className={`num ${s}`}>{m.margin}%</b></div>
                <Icon name="chevR" size={16} stroke={2} className="chev" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
