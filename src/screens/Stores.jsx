import '../styles/stores.css'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import { useStore } from '../state/store'
import { sig } from '../lib/calc'

/* 사업장 선택 — 앱의 홈(매번 들어오는 첫 화면).
   딥그린 헤더(브랜드·인사·전체 현황) + '내 가게' 카드 리스트.
   예전엔 '사업장 추가'가 "곧 지원돼요" 토스트였다. 이제 진짜로 추가·고치기·지우기가 된다. */

// 업종 칩 — 사장님이 직접 치지 않아도 되게 흔한 것만
const TYPES = ['분식·한식', '백반·찌개', '고깃집', '국밥·탕', '중식', '일식', '치킨·호프', '카페·디저트', '기타']
const NAME_MAX = 24

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const margins = (menus) => (Array.isArray(menus) ? menus : [])
  .map((m) => Number(m && m.margin))
  .filter((v) => Number.isFinite(v))
const avgOf = (arr) => (arr.length ? Math.round(arr.reduce((a, v) => a + v, 0) / arr.length) : null)

export default function Stores() {
  const nav = useNavigate()
  const { stores, menusOf, enterStore, currentStoreId, toast, safeMargin, addStore, updateStore, deleteStore } = useStore()
  // sheet: null | { mode:'add' } | { mode:'edit', id }
  const [sheet, setSheet] = useState(null)

  const list = Array.isArray(stores) ? stores : []
  const safePct = (safeMargin && safeMargin.pct) || 0

  const open = (id) => { enterStore(id); nav('/app/menu') }
  const info = (s) => {
    const menus = menusOf(s)   // 메뉴판·결과 화면과 같은 식으로 계산한 마진
    const n = menus.length
    const avg = avgOf(margins(menus))
    const bowls = menus.reduce((a, m) => a + (Number(m && m.pop) || 0), 0)
    const photo = (menus.find((m) => m && m.img) || {}).img || null
    return { n, avg, bowls, photo, s: avg == null ? '' : sig(avg, safePct) }
  }
  const totalMenus = list.reduce((a, s) => a + (Array.isArray(s.menus) ? s.menus.length : 0), 0)
  const avgAll = avgOf(list.flatMap((s) => margins(menusOf(s))))

  const editing = sheet && sheet.mode === 'edit' ? list.find((s) => s.id === sheet.id) : null

  const onAdd = ({ nm, type, loc }) => {
    const id = addStore({ nm, type, loc })
    setSheet(null)
    enterStore(id)
    toast(`<b>${esc(nm)}</b> 등록 완료 · 메뉴 0개로 시작해요. 첫 메뉴를 만들어 보세요`)
    nav('/app/menu')
  }
  const onSave = ({ nm, type, loc }) => {
    if (!editing) return
    updateStore(editing.id, { nm, type, loc })
    setSheet(null)
    toast(`<b>${esc(nm)}</b> 정보를 고쳤어요`)
  }
  const onDelete = () => {
    if (!editing || list.length <= 1) return
    const n = Array.isArray(editing.menus) ? editing.menus.length : 0
    const ok = window.confirm(`'${editing.nm}'을(를) 지울까요?\n\n메뉴 ${n}개와 판매 기록이 함께 사라져요.\n되돌릴 수 없어요.`)
    if (!ok) return
    const nm = editing.nm
    deleteStore(editing.id)
    setSheet(null)
    toast(`<b>${esc(nm)}</b>을(를) 지웠어요`)
  }

  return (
    <>
      <div className="scroll">
        <header className="st-hero fade">
          <div className="st-hero-brand"><span className="shb-logo"><Photo src="/img/logo.webp" icon="bowl" iconSize={15} /></span>오늘 몇 그릇?</div>
          <h1 className="st-hero-hi">사장님,<br />어느 가게부터 볼까요?</h1>
          <div className="st-hero-stats">
            <div className="shs"><b className="num">{list.length}</b><span>사업장</span></div>
            <span className="shs-div" />
            <div className="shs"><b className="num">{totalMenus}</b><span>메뉴</span></div>
            <span className="shs-div" />
            <div className="shs"><b className="num">{avgAll == null ? '—' : `${avgAll}%`}</b><span>평균 마진</span></div>
          </div>
        </header>

        <div className="st-sec">
          <div className="st-sec-head fade">
            <h2>내 가게</h2>
            <span className="num">{list.length}곳</span>
          </div>
          <div className="st-list">
            {list.map((s, i) => {
              const t = info(s)
              const active = s.id === currentStoreId
              const meta = [s.type, s.loc].filter(Boolean).join(' · ')
              return (
                <div className={`sr2-card fade${active ? ' is-on' : ''}`} key={s.id} style={{ animationDelay: `${0.05 + i * 0.05}s` }}>
                  <button className="sr2-open" onClick={() => open(s.id)} aria-label={`${s.nm} 들어가기`}>
                    <div className="st-photo"><Photo src={t.photo} icon="store" iconSize={24} alt={s.nm} /></div>
                    <div className="st-body">
                      <div className="st-nm sr2-nm">
                        <span className="sr2-nm-tx">{s.nm}</span>
                        {s.primary && <span className="st-badge">대표</span>}
                        {active && <span className="sr2-here">지금 보는 가게</span>}
                      </div>
                      <div className="st-metar">{meta ? `${meta} · ` : ''}메뉴 {t.n}개</div>
                      {t.avg == null ? (
                        <div className="sr2-empty"><Icon name="plus" size={13} stroke={2.4} />메뉴를 추가해 보세요 <span className="sr2-dash">마진 —</span></div>
                      ) : (
                        <div className="st-bar-row">
                          <span className="st-bar"><span className={`${t.s}-bg`} style={{ width: `${Math.max(6, Math.min(100, t.avg))}%` }} /></span>
                          <span className={`st-mg num ${t.s}`}>마진 {t.avg}%</span>
                          {t.bowls > 0 && <span className="st-bowls num">· 하루 {t.bowls}그릇</span>}
                        </div>
                      )}
                    </div>
                    <span className="st-go"><Icon name="chevR" size={17} stroke={2.4} /></span>
                  </button>
                  <button className="sr2-more" onClick={() => setSheet({ mode: 'edit', id: s.id })} aria-label={`${s.nm} 정보 고치기`}>
                    <Icon name="edit" size={18} stroke={2} />
                    <span>고치기</span>
                  </button>
                </div>
              )
            })}
            <button className="st-add sr2-add" onClick={() => setSheet({ mode: 'add' })}>
              <span className="st-add-ic"><Icon name="plus" size={18} stroke={2.3} /></span>
              <span className="st-add-tx"><b>사업장 추가</b><em>분점·다른 가게를 따로 관리해요</em></span>
            </button>
          </div>
        </div>
      </div>

      {sheet && sheet.mode === 'add' && (
        <StoreSheet
          key="add"
          title="새 가게 등록"
          submitLabel="등록하고 메뉴 만들기"
          note="새 가게는 메뉴 0개로 시작해요. 등록하면 바로 메뉴판으로 가요."
          names={list.map((s) => s.nm)}
          initial={{ nm: '', type: '', loc: '' }}
          onClose={() => setSheet(null)}
          onSubmit={onAdd}
        />
      )}
      {editing && (
        <StoreSheet
          key={`edit-${editing.id}`}
          title="가게 정보 고치기"
          submitLabel="저장"
          names={list.filter((s) => s.id !== editing.id).map((s) => s.nm)}
          initial={{ nm: editing.nm || '', type: editing.type || '', loc: editing.loc || '' }}
          onClose={() => setSheet(null)}
          onSubmit={onSave}
          danger={{
            disabled: list.length <= 1,
            reason: '가게가 한 곳뿐이라 지울 수 없어요. 다른 가게를 먼저 등록하세요.',
            menuCount: Array.isArray(editing.menus) ? editing.menus.length : 0,
            onDelete,
          }}
        />
      )}
      {/* 편집 중인 가게가 사라졌으면(다른 탭에서 지움 등) 시트를 닫는다 */}
      {sheet && sheet.mode === 'edit' && !editing && <CloseOnMount onClose={() => setSheet(null)} />}
    </>
  )
}

function CloseOnMount({ onClose }) {
  useEffect(() => { onClose() }, [onClose])
  return null
}

/* 가게 추가·수정 바텀시트 — .screen 안에서 absolute 로 뜬다 (모바일·PC 모두 작업 영역 안) */
function StoreSheet({ title, submitLabel, note, names, initial, onClose, onSubmit, danger }) {
  const [nm, setNm] = useState(initial.nm)
  const [type, setType] = useState(initial.type)
  const [loc, setLoc] = useState(initial.loc)
  const [tried, setTried] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    // 새 가게일 때만 이름 칸에 바로 커서 (수정 땐 키보드가 갑자기 올라오지 않게)
    if (!initial.nm && nameRef.current) {
      try { nameRef.current.focus({ preventScroll: true }) } catch { /* noop */ }
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, initial.nm])

  const clean = nm.trim()
  const empty = clean.length === 0
  const dup = !empty && names.some((x) => String(x || '').trim() === clean)
  // 기존 업종이 칩 목록에 없으면 그것도 칩으로 보여준다(지워지지 않게)
  const chips = type && !TYPES.includes(type) ? [type, ...TYPES] : TYPES

  const submit = (e) => {
    e.preventDefault()
    setTried(true)
    if (empty) { if (nameRef.current) nameRef.current.focus(); return }
    onSubmit({ nm: clean.slice(0, NAME_MAX), type, loc: loc.trim().slice(0, 24) })
  }

  return (
    <div className="sr2-wrap" onClick={onClose}>
      <form className="sr2-sheet" role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <div className="sr2-grab" />
        <div className="sr2-head">
          <b>{title}</b>
          <button type="button" className="sr2-x" onClick={onClose} aria-label="닫기"><Icon name="x" size={18} stroke={2.2} /></button>
        </div>

        <div className="sr2-body">
          <label className="sr2-field">
            <span>가게 이름 <i className="sr2-req">필수</i></span>
            <input ref={nameRef} type="text" value={nm} maxLength={NAME_MAX} placeholder="예: 행복분식 2호점"
              enterKeyHint="done" autoComplete="off"
              aria-invalid={tried && empty} onChange={(e) => setNm(e.target.value)} />
            {tried && empty && <em className="sr2-err">가게 이름을 적어 주세요</em>}
            {!empty && dup && <em className="sr2-hint">같은 이름의 가게가 이미 있어요. 구분되게 바꾸면 헷갈리지 않아요.</em>}
          </label>

          <div className="sr2-field">
            <span>업종 <i className="sr2-opt">고르기</i></span>
            <div className="sr2-chips" role="radiogroup" aria-label="업종">
              {chips.map((c) => (
                <button type="button" key={c} role="radio" aria-checked={type === c}
                  className={`sr2-chip${type === c ? ' on' : ''}`}
                  onClick={() => setType(type === c ? '' : c)}>
                  {type === c && <Icon name="check" size={14} stroke={2.6} />}{c}
                </button>
              ))}
            </div>
          </div>

          <label className="sr2-field">
            <span>지역 <i className="sr2-opt">선택</i></span>
            <input type="text" value={loc} maxLength={24} placeholder="예: 서울 마포" autoComplete="off"
              onChange={(e) => setLoc(e.target.value)} />
          </label>

          {note && <p className="sr2-note"><Icon name="info" size={15} stroke={2} />{note}</p>}
        </div>

        <button type="submit" className="sr2-save" disabled={tried && empty}>{submitLabel}</button>

        {danger && (
          <div className="sr2-danger">
            <button type="button" className="sr2-del" disabled={danger.disabled} onClick={danger.onDelete}>
              <Icon name="trash" size={16} stroke={2.1} />이 가게 지우기
            </button>
            <p className="sr2-del-why">
              {danger.disabled ? danger.reason : `메뉴 ${danger.menuCount}개와 판매 기록이 함께 사라져요.`}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
