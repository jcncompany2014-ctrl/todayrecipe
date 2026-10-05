import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/market2.css'
import Icon, { TrendTri } from '../components/Icon'
import Thumb from '../components/Thumb'
import Photo from '../components/Photo'
import Orb from '../components/Orb'
import { useStore } from '../state/store'
import { PRODUCTS, CATS, POPULAR, SECTIONS } from '../data/catalog'
import { summarize, won, round10, COOKS, YIELD } from '../lib/calc'

const CAT_TABS = [['all', '전체'], ['meat', '정육'], ['sea', '수산'], ['veg', '청과'], ['sauce', '양념'], ['etc', '기타']]
const CAT_KEYS = ['meat', 'sea', 'veg', 'sauce', 'etc']
const CAT_ICON = { meat: 'meat', sea: 'fish', veg: 'sprout', sauce: 'jar', etc: 'sack' }
const COOK_METHODS = COOKS.filter((k) => k !== '생')   // 볶기 · 삶기 · 튀김

/* cat 이 5종 밖이면 '기타'로 — 저장본이 깨져도 CATS[x].g 에서 죽지 않게 */
const catKey = (c) => (CAT_KEYS.includes(c) ? c : 'etc')
const catOf = (p) => CATS[catKey(p && p.cat)]
/* Thumb 는 CATS[product.cat] 과 product.icon 을 그대로 믿는다 — 넘기기 전에 다듬는다 */
const safeProduct = (p) => {
  const cat = catKey(p.cat)
  return { ...p, cat, icon: p.icon || CAT_ICON[cat] }
}
/* 토스트는 HTML 로 그려진다 — 사장님이 입력한 이름은 반드시 이스케이프 */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/* "12,000" · "12000원" 처럼 써도 숫자만 읽는다 */
const num = (v) => {
  const s = String(v == null ? '' : v).replace(/[^\d.]/g, '')
  return s ? Number(s) : NaN
}

function Trend({ t }) {
  if (!Array.isArray(t) || t[0] === 'fl' || !t[0]) return <span className="trend fl">시세 보통</span>
  const dir = t[0]
  return <span className={`trend ${dir}`}><TrendTri dir={dir} />{t[1]}% {dir === 'dn' ? '저렴' : '비쌈'}</span>
}

/* ── 재료 직접 추가 / 고치기 폼 ─────────────────────────────────────── */
const UNIT_MODES = [
  ['kg', '1kg에'],
  ['100g', '100g에'],
  ['pack', '한 봉·통에'],
]

function blankForm(nm = '') {
  return { nm, cat: 'etc', unitMode: 'kg', price: '', packG: '', cooked: false, method: '볶기', defG: '100' }
}
function formFrom(p) {
  const perG = Number(p.perG) || 0
  return {
    nm: p.nm || '',
    cat: catKey(p.cat),
    unitMode: 'kg',
    price: perG > 0 ? String(Math.round(perG * 1000)) : '',
    packG: '',
    cooked: !!p.cookable,
    method: COOK_METHODS.includes(p.method) ? p.method : '볶기',
    defG: String(p.defG > 0 ? p.defG : 100),
  }
}
function perGOf(f) {
  const price = num(f.price)
  if (!(price > 0)) return NaN
  if (f.unitMode === '100g') return price / 100
  if (f.unitMode === 'pack') {
    const g = num(f.packG)
    return g > 0 ? price / g : NaN
  }
  return price / 1000
}

function ProductSheet({ editId, initial, onClose, onSaved, onDeleted }) {
  const { addProduct, updateProduct, deleteProduct, productInUse } = useStore()
  const [f, setF] = useState(initial)
  const [delMsg, setDelMsg] = useState('')
  const set = (patch) => setF((cur) => ({ ...cur, ...patch }))

  const name = f.nm.trim()
  const perG = perGOf(f)
  const perGOk = isFinite(perG) && perG >= 0.01   // 저장은 원/g 소수 둘째 자리까지 — 그보다 작으면 0원이 된다
  const defG = num(f.defG)
  const defGOk = defG >= 1 && defG <= 5000
  const valid = !!name && perGOk && defGOk

  const priceTouched = f.price !== ''
  const priceErr = priceTouched && !(num(f.price) > 0)
    ? '가격을 숫자로 넣어주세요'
    : f.unitMode === 'pack' && priceTouched && !(num(f.packG) > 0)
      ? '한 봉·통이 몇 g인지 넣어주세요'
      : priceTouched && isFinite(perG) && perG < 0.01
        ? '가격이 너무 작아요 — 1kg 기준 10원 이상이어야 해요'
        : ''

  const yieldPct = f.cooked ? (YIELD[f.method] || 100) : 100
  const bowlCost = perGOk && defGOk ? (perG * defG) / (yieldPct / 100) : null

  // 이름이 카탈로그·내 재료에 이미 있으면 알려만 준다 (막지는 않는다)
  const dup = name && Object.keys(PRODUCTS).some((id) => id !== editId && PRODUCTS[id] && PRODUCTS[id].nm === name)
  const usedBy = editId ? productInUse(editId) : null

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const save = () => {
    if (!valid) return
    const cookable = !!f.cooked
    const method = cookable ? f.method : '생'
    const g = Math.round(defG)
    if (editId) {
      const cat = catKey(f.cat)
      const p2 = Math.round(perG * 100) / 100
      updateProduct(editId, {
        nm: name.slice(0, 20), cat, icon: CAT_ICON[cat],
        perG: p2, price: Math.round(p2 * 1000), unit: '/kg',
        cookable, method, defG: g,
      })
      onSaved(editId, name, false)
    } else {
      const id = addProduct({ nm: name, cat: catKey(f.cat), perG, cookable, method, defG: g })
      if (!id) { setDelMsg('저장하지 못했어요. 이름과 가격을 다시 확인해 주세요.'); return }
      onSaved(id, name, true)
    }
  }

  const remove = () => {
    if (!editId) return
    const used = productInUse(editId)
    if (used) { setDelMsg(`${used}에서 쓰고 있어서 지울 수 없어요. 그 메뉴에서 먼저 빼주세요.`); return }
    if (!window.confirm(`'${name || '이 재료'}'를 지울까요?\n지우면 되돌릴 수 없어요.`)) return
    const r = deleteProduct(editId)
    if (r && r.ok === false) { setDelMsg(`${r.usedBy}에서 쓰고 있어서 지울 수 없어요. 그 메뉴에서 먼저 빼주세요.`); return }
    onDeleted(editId, name)
  }

  return (
    <div className="mk2-wrap" onClick={onClose}>
      <div className="mk2-sheet" role="dialog" aria-modal="true" aria-labelledby="mk2-title" onClick={(e) => e.stopPropagation()}>
        <div className="mk2-grab" />
        <div className="mk2-shead">
          <h2 id="mk2-title">{editId ? '내 재료 고치기' : '재료 직접 추가'}</h2>
          <button className="mk2-x" aria-label="닫기" onClick={onClose}><Icon name="x" size={20} stroke={2.2} /></button>
        </div>
        {!editId && <p className="mk2-lead">목록에 없는 재료도 가격만 알면 원가 계산에 넣을 수 있어요.</p>}

        {/* 이름 */}
        <label className="mk2-lab" htmlFor="mk2-nm">재료 이름 <em>필수</em></label>
        <input id="mk2-nm" className="mk2-in" placeholder="예) 우리집 특제소스" maxLength={20}
          value={f.nm} onChange={(e) => set({ nm: e.target.value })} autoComplete="off" />
        {dup && <p className="mk2-hint">같은 이름의 재료가 이미 있어요. 그래도 따로 만들 수 있어요.</p>}

        {/* 분류 */}
        <div className="mk2-lab">분류</div>
        <div className="mk2-chips" role="radiogroup" aria-label="분류">
          {CAT_KEYS.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={f.cat === k}
              className={`mk2-chip${f.cat === k ? ' on' : ''}`} onClick={() => set({ cat: k })}>
              <span className="mk2-chip-ic" style={{ background: CATS[k].g, color: CATS[k].c }}>
                <Icon name={CAT_ICON[k]} size={18} stroke={1.8} />
              </span>
              {CATS[k].label}
            </button>
          ))}
        </div>

        {/* 가격 */}
        <div className="mk2-lab">사 오는 가격</div>
        <div className="mk2-seg" role="radiogroup" aria-label="가격 기준">
          {UNIT_MODES.map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={f.unitMode === k}
              className={f.unitMode === k ? 'on' : ''} onClick={() => set({ unitMode: k })}>{label}</button>
          ))}
        </div>
        {f.unitMode === 'pack' && (
          <div className="mk2-field">
            <input className="mk2-in num" inputMode="numeric" placeholder="500" aria-label="한 봉·통 용량(g)"
              value={f.packG} onChange={(e) => set({ packG: e.target.value })} />
            <span className="mk2-unit">g짜리를</span>
          </div>
        )}
        <div className="mk2-field">
          <input className="mk2-in num" inputMode="numeric" placeholder={f.unitMode === '100g' ? '1,200' : f.unitMode === 'pack' ? '3,500' : '12,000'}
            aria-label="가격(원)" value={f.price} onChange={(e) => set({ price: e.target.value })} />
          <span className="mk2-unit">원</span>
        </div>
        {priceErr
          ? <p className="mk2-err">{priceErr}</p>
          : perGOk && <p className="mk2-calc num">= 1kg에 {won(perG * 1000)}원 · 100g에 {won(perG * 100)}원</p>}

        {/* 조리 */}
        <div className="mk2-lab">조리하나요?</div>
        <div className="mk2-seg" role="radiogroup" aria-label="조리 여부">
          <button type="button" role="radio" aria-checked={!f.cooked} className={!f.cooked ? 'on' : ''}
            onClick={() => set({ cooked: false })}>생 그대로 써요</button>
          <button type="button" role="radio" aria-checked={f.cooked} className={f.cooked ? 'on' : ''}
            onClick={() => set({ cooked: true })}>익혀서 써요</button>
        </div>
        {f.cooked && (
          <div className="mk2-chips mk2-cook" role="radiogroup" aria-label="조리법">
            {COOK_METHODS.map((k) => (
              <button key={k} type="button" role="radio" aria-checked={f.method === k}
                className={`mk2-chip${f.method === k ? ' on' : ''}`} onClick={() => set({ method: k })}>
                {k}<em className="num">수율 {YIELD[k]}%</em>
              </button>
            ))}
          </div>
        )}

        {/* 한 그릇 사용량 */}
        <label className="mk2-lab" htmlFor="mk2-g">한 그릇에 보통 몇 g 넣나요?</label>
        <div className="mk2-field">
          <input id="mk2-g" className="mk2-in num" inputMode="numeric" placeholder="100"
            value={f.defG} onChange={(e) => set({ defG: e.target.value })} />
          <span className="mk2-unit">g</span>
        </div>
        {f.defG !== '' && !defGOk && <p className="mk2-err">1g ~ 5,000g 사이로 넣어주세요</p>}

        {bowlCost != null && (
          <div className="mk2-preview">
            <span>한 그릇에 드는 이 재료값</span>
            <b className="num">약 {won(round10(bowlCost) || Math.round(bowlCost))}원</b>
            <em>{won(defG)}g{f.cooked ? ` · ${f.method} 수율 ${yieldPct}% 반영` : ''}</em>
          </div>
        )}

        {editId && usedBy && !delMsg && (
          <p className="mk2-hint">{usedBy}에서 쓰고 있어요. 가격을 바꾸면 그 메뉴 원가도 같이 바뀌어요.</p>
        )}
        {delMsg && <p className="mk2-err mk2-errbox" role="alert">{delMsg}</p>}

        <button className="mk2-save" disabled={!valid} onClick={save}>
          {editId ? '고친 내용 저장' : '추가하고 바로 담기'}
        </button>
        {editId && (
          <button className="mk2-del" onClick={remove}>
            <Icon name="trash" size={17} stroke={2} />이 재료 지우기
          </button>
        )}
      </div>
    </div>
  )
}

export default function Market() {
  const nav = useNavigate()
  const { build, inBuild, toggleItem, costOpts, toast, customProducts } = useStore()
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const [sheet, setSheet] = useState(null)        // { editId?, initial }
  const [pendingAdd, setPendingAdd] = useState(null)

  const items = build.items || []
  const { food, margin } = summarize(items, build.price, costOpts)

  const handleToggle = (id) => {
    const p = PRODUCTS[id]
    if (!p) return
    const has = inBuild(id)
    const before = summarize(items, build.price, costOpts).margin
    const next = has ? items.filter((i) => i.id !== id) : [...items, { id, grams: p.defG, method: p.method }]
    const after = summarize(next, build.price, costOpts).margin
    toggleItem(id)
    toast(`<b>${esc(p.nm)}</b> ${has ? '뺐어요' : '담았어요'} · 예상 마진 ${before}% → ${after}%`)
  }

  /* 새 재료는 스토어가 다음 렌더에서 카탈로그에 등록한다 — 등록된 걸 확인한 뒤 담는다 */
  useEffect(() => {
    if (!pendingAdd) return
    if (!customProducts || !customProducts[pendingAdd] || !PRODUCTS[pendingAdd]) return
    const id = pendingAdd
    setPendingAdd(null)
    const p = PRODUCTS[id]
    if (inBuild(id)) { toast(`<b>${esc(p.nm)}</b> 추가했어요`); return }
    const before = summarize(items, build.price, costOpts).margin
    const after = summarize([...items, { id, grams: p.defG, method: p.method }], build.price, costOpts).margin
    toggleItem(id)
    toast(`<b>${esc(p.nm)}</b> 추가하고 담았어요 · 예상 마진 ${before}% → ${after}%`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAdd, customProducts])

  const customIds = useMemo(
    () => Object.keys(customProducts || {}).filter((id) => PRODUCTS[id]).reverse(),   // 최근 추가가 위로
    [customProducts],
  )

  const query = q.trim()
  const results = useMemo(() => {
    if (!query) return null
    const ql = query.toLowerCase()
    return Object.keys(PRODUCTS).filter((id) => PRODUCTS[id] && String(PRODUCTS[id].nm || '').toLowerCase().includes(ql))
  }, [query, customProducts])

  const sections = cat === 'all' ? SECTIONS : SECTIONS.filter((s) => s.cat === cat)
  const myIds = cat === 'all' ? customIds : customIds.filter((id) => catKey(PRODUCTS[id].cat) === cat)

  const openAdd = (nm = '') => { setSel(null); setSheet({ editId: null, initial: blankForm(nm) }) }
  const openEdit = (id) => {
    const p = PRODUCTS[id]
    if (!p) return
    setSel(null)
    setSheet({ editId: id, initial: formFrom(p) })
  }
  const closeSheet = () => setSheet(null)

  const onSaved = (id, nm, isNew) => {
    setSheet(null)
    if (isNew) setPendingAdd(id)
    else toast(`<b>${esc(nm)}</b> 고쳤어요`)
  }
  const onDeleted = (id, nm) => {
    setSheet(null)
    if (sel === id) setSel(null)
    toast(`<b>${esc(nm)}</b> 지웠어요`)
  }

  const AddBtn = (id) => (
    <button className={`addv${inBuild(id) ? ' in' : ''}`} aria-label={inBuild(id) ? '빼기' : '담기'}
      onClick={(e) => { e.stopPropagation(); handleToggle(id) }}>
      <Icon name={inBuild(id) ? 'check' : 'plus'} size={20} stroke={2.4} />
    </button>
  )

  const Row = (id) => {
    const p = PRODUCTS[id]
    if (!p) return null
    const sp = safeProduct(p)
    return (
      <div key={id} className="vitem" onClick={() => setSel(id)}>
        <div className="vthumb" style={{ background: catOf(p).g }}><Thumb product={sp} iconSize={34} /></div>
        <div className="vmid">
          <div className="nm">{p.nm}{p.custom && <span className="mk2-tag">내 재료</span>}</div>
          <div className="pr num">{won(p.price)}원<i>{p.unit}</i></div>
          <div className="vmeta num">{p.origin} · 100g당 {won(p.perG * 100)}원</div>
          {!p.custom && <Trend t={p.trend} />}
        </div>
        {AddBtn(id)}
      </div>
    )
  }

  const MyRow = (id) => {
    const p = PRODUCTS[id]
    if (!p) return null
    const sp = safeProduct(p)
    return (
      <div key={id} className="vitem mk2-my" onClick={() => setSel(id)}>
        <div className="vthumb" style={{ background: catOf(p).g }}><Thumb product={sp} iconSize={34} /></div>
        <div className="vmid">
          <div className="nm">{p.nm}</div>
          <div className="pr num">{won(p.perG * 1000)}원<i>/kg</i></div>
          <div className="vmeta num">
            {catOf(p).label} · {p.cookable ? `${p.method}` : '생으로'} · 한 그릇 {won(p.defG)}g
          </div>
        </div>
        <button className="mk2-edit" aria-label={`${p.nm} 고치기`}
          onClick={(e) => { e.stopPropagation(); openEdit(id) }}>
          <Icon name="edit" size={19} stroke={2} />
        </button>
        {AddBtn(id)}
      </div>
    )
  }

  const AddCTA = ({ nm = '' }) => (
    <button className="mk2-cta" onClick={() => openAdd(nm)}>
      <span className="mk2-cta-ic"><Icon name="plus" size={20} stroke={2.4} /></span>
      <span className="mk2-cta-tx">
        <b>찾는 재료가 없나요?</b>
        <span>{nm ? `'${nm}' 직접 추가하기` : '직접 추가하기'}</span>
      </span>
      <Icon name="chevR" size={18} stroke={2.2} className="mk2-cta-cr" />
    </button>
  )

  const selP = sel ? PRODUCTS[sel] : null
  const maxReal = selP ? Math.round((selP.perG * 100) / (Math.min(...COOKS.map((k) => YIELD[k])) / 100)) : 0
  const selTrend = selP && Array.isArray(selP.trend) ? selP.trend : ['fl', 0]

  return (
    <>
      <div className="scroll">
        <div className="mkt-head fade">
          <div className="mh-top">
            <button className="iconbtn" aria-label="뒤로" onClick={() => nav('/app')}><Icon name="back" size={22} stroke={2} /></button>
            <span className="mh-title">재료 담기</span>
          </div>
          <button className="chip" aria-label="다른 메뉴로 바꾸기" onClick={() => nav('/app/menu')}>
            <span className="chip-ic"><Photo src={build.img} icon={build.icon || 'bowl'} iconSize={16} /></span>
            <span className="chip-tx"><b>{build.nm || '새 메뉴'}</b><span>담는 중</span></span>
            <Icon name="chevR" size={16} stroke={2} className="cd" />
          </button>
          <div className="search">
            <Icon name="search" size={18} stroke={2} />
            <input className="mk2-search-in" placeholder="삼겹살, 양파, 고추장…" value={q} onChange={(e) => setQ(e.target.value)}
              enterKeyHint="search" aria-label="재료 찾기" />
            {q && <button className="search-x" aria-label="지우기" onClick={() => setQ('')}><Icon name="x" size={15} stroke={2.2} /></button>}
          </div>
        </div>

        {results ? (
          <div className="vsec">
            <div className="sec-head"><h2>'{query}' 검색 결과</h2><span className="more num">{results.length}개</span></div>
            {results.length ? (
              <>
                <div className="vlist">{results.map(Row)}</div>
                <div className="mk2-tail"><AddCTA nm={results.some((id) => PRODUCTS[id] && PRODUCTS[id].nm === query) ? '' : query.slice(0, 20)} /></div>
              </>
            ) : (
              <div className="mk2-empty">
                <Orb mood="searching" size={32} tone="muted" label="재료를 찾는 중" />
                <p>'{query}'은(는) 목록에 없어요</p>
                <span>다른 이름으로 찾아보시거나, 가격만 알면 바로 추가할 수 있어요</span>
                <button className="mk2-empty-btn" onClick={() => openAdd(query.slice(0, 20))}>
                  <Icon name="plus" size={18} stroke={2.4} />'{query.slice(0, 20)}' 직접 추가하기
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="catbar">
              <div className="cats">
                {CAT_TABS.map(([k, label]) => (
                  <button key={k} className={`cat${cat === k ? ' on' : ''}`} onClick={() => setCat(k)}>{label}</button>
                ))}
              </div>
            </div>

            {myIds.length > 0 && (
              <div className="vsec mk2-mysec">
                <div className="sec-head">
                  <h2>내가 추가한 재료</h2>
                  <button className="mk2-more" onClick={() => openAdd()}>
                    <Icon name="plus" size={15} stroke={2.4} />추가
                  </button>
                </div>
                <div className="vlist">{myIds.map(MyRow)}</div>
              </div>
            )}

            {cat === 'all' && (
              <>
                <div className="sec-head"><h2>사장님이 많이 담아요</h2></div>
                <div className="hscroll">
                  {POPULAR.filter((id) => PRODUCTS[id]).map((id) => {
                    const p = PRODUCTS[id]
                    return (
                      <div key={id} className="hcard" onClick={() => setSel(id)}>
                        <div className="himg" style={{ background: catOf(p).g }}>
                          <Thumb product={safeProduct(p)} iconSize={56} />
                          <button className={`add${inBuild(id) ? ' in' : ''}`} aria-label="담기"
                            onClick={(e) => { e.stopPropagation(); handleToggle(id) }}>
                            <Icon name={inBuild(id) ? 'check' : 'plus'} size={19} stroke={2.4} />
                          </button>
                        </div>
                        <div className="hcard-tx">
                          <div className="nm">{p.nm}</div>
                          <div className="pr num">{won(p.price)}원<i>{p.unit}</i></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {sections.map((sec) => (
              <div key={sec.cat} className="vsec">
                <div className="sec-head"><h2>{catOf(sec).label}</h2></div>
                <div className="vlist">{sec.ids.map(Row)}</div>
              </div>
            ))}

            <div className="mk2-tail"><AddCTA /></div>
          </>
        )}
      </div>

      <button className={`cartbar${items.length === 0 ? ' hide' : ''}`} onClick={() => nav('/app/cart')}>
        <div className="cb-left">
          <span className="cb-cart"><Icon name="cart" size={20} stroke={1.8} /><span className="cb-badge num">{items.length}</span></span>
          <span className="cb-tx"><span className="l1">장바구니 {items.length}개</span><span className="l2 num">식자재 {won(round10(food))}원</span></span>
        </div>
        <div className="cb-right">
          <span className="cb-margin"><span>예상 마진</span><b className="num">{margin}%</b></span>
          <Icon name="chevR" size={18} stroke={2.2} className="cr" />
        </div>
      </button>

      {/* 재료 상세 시트 */}
      {selP && (
        <div className="psheet-wrap" onClick={() => setSel(null)}>
          <div className="psheet" onClick={(e) => e.stopPropagation()}>
            <div className="ps-grab" />
            <div className="ps-top">
              <div className="ps-img" style={{ background: catOf(selP).g }}><Thumb product={safeProduct(selP)} iconSize={44} /></div>
              <div className="ps-head">
                <b>{selP.nm}</b>
                <div className="ps-chips">{selP.origin && <span>{selP.origin}</span>}{selP.spec && <span>{selP.spec}</span>}</div>
                <div className="ps-price num">{won(selP.price)}원<i>{selP.unit}</i><em>100g당 {won(selP.perG * 100)}원</em></div>
              </div>
              <button className="ps-x" aria-label="닫기" onClick={() => setSel(null)}><Icon name="x" size={17} stroke={2.2} /></button>
            </div>

            {selP.cookable ? (
              <div className="ps-yield">
                <div className="ps-yt">조리하면 실제 원가가 이렇게 달라져요 <span>100g 기준</span></div>
                {COOKS.map((k) => {
                  const y = YIELD[k]
                  const real = Math.round((selP.perG * 100) / (y / 100))
                  return (
                    <div className="ps-yr" key={k}>
                      <span className="ps-ck">{k}</span>
                      <i className="ps-track"><b style={{ width: `${maxReal > 0 ? (real / maxReal) * 100 : 0}%` }} /></i>
                      <b className="ps-real num">{won(real)}원</b>
                      <em className="num">수율 {y}%</em>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="ps-raw">조리 손실이 없는 재료예요 · 수율 100% 고정</div>
            )}

            {selP.custom ? (
              <div className="ps-trend">사장님이 직접 넣은 가격이에요 · 값이 바뀌면 고쳐주세요</div>
            ) : (
              <div className={`ps-trend ${selTrend[0]}`}>
                {selTrend[0] === 'dn' && <>지금 평소보다 <b>{selTrend[1]}% 저렴</b>한 시기예요 — 담기 좋은 때</>}
                {selTrend[0] === 'up' && <>지금 평소보다 <b>{selTrend[1]}% 비싼</b> 시기예요 — 대체 재료도 살펴보세요</>}
                {selTrend[0] !== 'dn' && selTrend[0] !== 'up' && <>시세가 평소 수준이에요</>}
              </div>
            )}

            <button className={`ps-add${inBuild(sel) ? ' in' : ''}`} onClick={() => handleToggle(sel)}>
              {inBuild(sel) ? '담겨 있어요 · 누르면 빼요' : '장바구니에 담기'}
            </button>
            {selP.custom && (
              <button className="mk2-ps-edit" onClick={() => openEdit(sel)}>
                <Icon name="edit" size={17} stroke={2} />가격·사용량 고치기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 재료 직접 추가 / 고치기 시트 */}
      {sheet && (
        <ProductSheet key={sheet.editId || 'new'} editId={sheet.editId} initial={sheet.initial}
          onClose={closeSheet} onSaved={onSaved} onDeleted={onDeleted} />
      )}
    </>
  )
}
