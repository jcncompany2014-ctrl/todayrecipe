import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useStore } from '../state/store'
import { won, round10, breakeven, DAILY_FIXED } from '../lib/calc'

export default function Menu() {
  const nav = useNavigate()
  const { menus, loadMenu } = useStore()

  const profitOf = (m) => (m.price * m.margin) / 100
  const avg = round10(menus.reduce((a, m) => a + profitOf(m), 0) / menus.length)
  const best = menus.reduce((a, b) => (b.margin > a.margin ? b : a))
  const rep = menus.find((m) => m.badge) || best
  const repBowls = breakeven(profitOf(rep), DAILY_FIXED)

  const openMenu = (m) => { loadMenu(m); nav('/app/result') }

  return (
    <div className="scroll">
      <div className="hd fade">
        <div className="hd-brand">
          <div className="logo"><Icon name="bowl" size={15} stroke={1.9} /></div>
          <span className="hd-wordmark">오늘 몇 그릇?</span>
        </div>
        <div className="hd-row">
          <h1 className="hd-title">내 메뉴판</h1>
          <span className="hd-count num">메뉴 {menus.length}개</span>
        </div>
      </div>

      <div className="hero fade" style={{ animationDelay: '.05s' }}>
        <div className="hero-label">오늘 본전을 맞추려면</div>
        <div className="hero-num">
          <b className="num">{repBowls}</b><span className="unit">그릇</span><span className="tail">팔면 돼요</span>
        </div>
        <hr className="hero-rule" />
        <div className="hero-sub">
          한 그릇 평균 <span className="accent num">{won(avg)}원</span> 남아요 · 효자 메뉴는 <span className="accent">{best.nm}</span>
        </div>
      </div>

      <div className="list">
        {menus.map((m, i) => {
          const s = m.margin >= 30 ? 'g' : m.margin >= 20 ? 'w' : 'b'
          return (
            <div key={m.id} className="card fade" style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              onClick={() => openMenu(m)}>
              <div className="card-top">
                <div className="tile"><Icon name={m.icon} size={26} stroke={1.7} /></div>
                <div className="card-mid">
                  <div className="card-name">
                    <h3>{m.nm}</h3>
                    {m.badge && <span className="badge">{m.badge}</span>}
                  </div>
                  <div className="card-price num">{won(m.price)}원</div>
                </div>
                <div className="card-end">
                  <div className="pct"><span className={`dot ${s}-bg`} /><b className={`num ${s}`}>{m.margin}%</b></div>
                  <Icon name="chevR" size={17} stroke={2} className="chev" />
                </div>
              </div>
              <div className="bar"><span className={`${s}-bg`} style={{ width: `${Math.max(2, Math.min(100, m.margin))}%` }} /></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
