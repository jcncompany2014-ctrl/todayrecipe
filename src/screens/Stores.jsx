import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import { useStore } from '../state/store'
import { sig } from '../lib/calc'

/* 사업장 선택 — 앱의 홈(매번 들어오는 첫 화면). 가게를 고르면 그 매장 메뉴판으로. */
export default function Stores() {
  const nav = useNavigate()
  const { stores, enterStore, currentStoreId, toast } = useStore()

  const open = (id) => { enterStore(id); nav('/app/menu') }
  const info = (s) => {
    const n = s.menus.length
    const avg = n ? Math.round(s.menus.reduce((a, m) => a + m.margin, 0) / n) : 0
    const bowls = s.menus.reduce((a, m) => a + (m.pop || 0), 0)
    const photo = (s.menus.find((m) => m.img) || {}).img || null
    return { n, avg, bowls, photo, s: sig(avg) }
  }
  const totalMenus = stores.reduce((a, s) => a + s.menus.length, 0)
  const allMargins = stores.flatMap((s) => s.menus.map((m) => m.margin))
  const avgAll = allMargins.length ? Math.round(allMargins.reduce((a, m) => a + m, 0) / allMargins.length) : 0

  return (
    <div className="scroll">
      <div className="st-top fade">
        <div className="hd-brand">
          <div className="logo-img"><Photo src="/img/logo.webp" icon="bowl" iconSize={17} /></div>
          <span className="hd-wordmark">오늘 몇 그릇?</span>
        </div>
        <h1 className="st-hi">어느 가게부터<br />볼까요?</h1>
        <div className="st-summary">
          <span>가게 <b className="num">{stores.length}</b></span>
          <i />
          <span>메뉴 <b className="num">{totalMenus}</b></span>
          <i />
          <span>평균 마진 <b className={`num ${sig(avgAll)}`}>{avgAll}%</b></span>
        </div>
      </div>

      <div className="st-list">
        {stores.map((s, i) => {
          const t = info(s)
          const active = s.id === currentStoreId
          return (
            <button className={`st-card fade${active ? ' active' : ''}`} key={s.id} style={{ animationDelay: `${0.06 + i * 0.05}s` }} onClick={() => open(s.id)}>
              <div className="st-photo"><Photo src={t.photo} icon="store" iconSize={24} alt={s.nm} /></div>
              <div className="st-body">
                <div className="st-nm">{s.nm}{s.primary && <span className="st-badge">대표</span>}</div>
                <div className="st-metar">{s.type} · {s.loc} · 메뉴 {t.n}</div>
                <div className="st-bar-row">
                  <span className="st-bar"><span className={`${t.s}-bg`} style={{ width: `${Math.max(6, Math.min(100, t.avg))}%` }} /></span>
                  <span className={`st-mg num ${t.s}`}>마진 {t.avg}%</span>
                  <span className="st-bowls num">· 하루 {t.bowls}그릇</span>
                </div>
              </div>
              <span className="st-go"><Icon name="chevR" size={17} stroke={2.4} /></span>
            </button>
          )
        })}
        <button className="st-add" onClick={() => toast('사업장 추가는 곧 지원돼요')}>
          <Icon name="plus" size={17} stroke={2.2} />사업장 추가
        </button>
      </div>
    </div>
  )
}
