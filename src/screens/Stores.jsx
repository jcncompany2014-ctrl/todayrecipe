import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import { useStore } from '../state/store'
import { sig } from '../lib/calc'

/* 사업장 선택 — 앱의 홈. 관리할 가게를 고르면 그 매장 메뉴판으로 들어간다. */
export default function Stores() {
  const nav = useNavigate()
  const { stores, enterStore, currentStoreId, toast } = useStore()

  const open = (id) => { enterStore(id); nav('/app/menu') }
  const stat = (s) => {
    const n = s.menus.length
    const avg = n ? Math.round(s.menus.reduce((a, m) => a + m.margin, 0) / n) : 0
    const bowls = s.menus.reduce((a, m) => a + (m.pop || 0), 0)
    return { n, avg, bowls, s: sig(avg) }
  }

  return (
    <div className="scroll">
      <div className="hd fade">
        <div className="hd-brand">
          <div className="logo-img"><Photo src="/img/logo.webp" icon="bowl" iconSize={17} /></div>
          <span className="hd-wordmark">오늘 몇 그릇?</span>
        </div>
        <div className="hd-row">
          <h1 className="hd-title">내 사업장</h1>
          <span className="hd-count num">{stores.length}곳 관리 중</span>
        </div>
      </div>

      <p className="st-intro fade">관리할 가게를 골라주세요. 매장마다 메뉴·마진·손익이 <b>따로</b> 관리돼요.</p>

      <div className="st-list">
        {stores.map((s, i) => {
          const t = stat(s)
          return (
            <button className="st-card fade" key={s.id} style={{ animationDelay: `${0.05 + i * 0.05}s` }} onClick={() => open(s.id)}>
              <span className="st-ic"><Icon name="store" size={22} stroke={1.7} /></span>
              <div className="st-body">
                <div className="st-nm">
                  {s.nm}
                  {s.id === currentStoreId ? <span className="st-badge on">선택됨</span> : s.primary && <span className="st-badge">대표</span>}
                </div>
                <div className="st-metar">{s.type} · {s.loc}</div>
                <div className="st-stats">
                  <span>메뉴 <b className="num">{t.n}</b></span>
                  <span className="st-dot">·</span>
                  <span>평균 마진 <b className={`num ${t.s}`}>{t.avg}%</b></span>
                  <span className="st-dot">·</span>
                  <span>하루 <b className="num">{t.bowls}</b>그릇</span>
                </div>
              </div>
              <Icon name="chevR" size={18} stroke={2} className="st-chev" />
            </button>
          )
        })}
        <button className="st-add" onClick={() => toast('사업장 추가는 곧 지원돼요')}>
          <Icon name="plus" size={18} stroke={2.2} />사업장 추가
        </button>
      </div>
    </div>
  )
}
