import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { TrendTri } from '../components/Icon'
import Thumb from '../components/Thumb'
import Photo from '../components/Photo'
import { useStore } from '../state/store'
import { PRODUCTS, CATS, POPULAR, SECTIONS } from '../data/catalog'
import { summarize, won, round10, COOKS, YIELD } from '../lib/calc'

const CAT_TABS = [['all', '전체'], ['meat', '정육'], ['sea', '수산'], ['veg', '청과'], ['sauce', '양념'], ['etc', '기타']]

function Trend({ t }) {
  if (t[0] === 'fl') return <span className="trend fl">시세 보통</span>
  const dir = t[0]
  return <span className={`trend ${dir}`}><TrendTri dir={dir} />{t[1]}% {dir === 'dn' ? '저렴' : '비쌈'}</span>
}

export default function Market() {
  const nav = useNavigate()
  const { build, inBuild, toggleItem, costOpts, toast } = useStore()
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)

  const { food, margin } = summarize(build.items, build.price, costOpts)

  const handleToggle = (id) => {
    const has = inBuild(id)
    const p = PRODUCTS[id]
    const before = summarize(build.items, build.price, costOpts).margin
    const next = has ? build.items.filter((i) => i.id !== id) : [...build.items, { id, grams: p.defG, method: p.method }]
    const after = summarize(next, build.price, costOpts).margin
    toggleItem(id)
    toast(`<b>${p.nm}</b> ${has ? '뺐어요' : '담았어요'} · 예상 마진 ${before}% → ${after}%`)
  }

  const query = q.trim()
  const results = useMemo(() => {
    if (!query) return null
    return Object.keys(PRODUCTS).filter((id) => PRODUCTS[id].nm.includes(query))
  }, [query])

  const sections = cat === 'all' ? SECTIONS : SECTIONS.filter((s) => s.cat === cat)

  const Row = (id) => {
    const p = PRODUCTS[id]
    return (
      <div key={id} className="vitem" onClick={() => setSel(id)}>
        <div className="vthumb" style={{ background: CATS[p.cat].g }}><Thumb product={p} iconSize={34} /></div>
        <div className="vmid">
          <div className="nm">{p.nm}</div>
          <div className="pr num">{won(p.price)}원<i>{p.unit}</i></div>
          <div className="vmeta num">{p.origin} · 100g당 {won(p.perG * 100)}원</div>
          <Trend t={p.trend} />
        </div>
        <button className={`addv${inBuild(id) ? ' in' : ''}`} aria-label="담기"
          onClick={(e) => { e.stopPropagation(); handleToggle(id) }}>
          <Icon name={inBuild(id) ? 'check' : 'plus'} size={20} stroke={2.4} />
        </button>
      </div>
    )
  }

  const selP = sel ? PRODUCTS[sel] : null
  const maxReal = selP ? Math.round((selP.perG * 100) / (Math.min(...COOKS.map((k) => YIELD[k])) / 100)) : 0

  return (
    <>
      <div className="scroll">
        <div className="mkt-head fade">
          <div className="mh-top">
            <button className="iconbtn" aria-label="뒤로" onClick={() => nav('/app')}><Icon name="back" size={22} stroke={2} /></button>
            <span className="mh-title">재료 담기</span>
          </div>
          <button className="chip" onClick={() => toast('메뉴를 바꾸거나 새로 만들 수 있어요')}>
            <span className="chip-ic"><Photo src={build.img} icon={build.icon || 'bowl'} iconSize={16} /></span>
            <span className="chip-tx"><b>{build.nm}</b><span>담는 중</span></span>
            <Icon name="chevD" size={16} stroke={2} className="cd" />
          </button>
          <div className="search">
            <Icon name="search" size={18} stroke={2} />
            <input placeholder="삼겹살, 양파, 고추장…" value={q} onChange={(e) => setQ(e.target.value)} />
            {q && <button className="search-x" aria-label="지우기" onClick={() => setQ('')}><Icon name="x" size={15} stroke={2.2} /></button>}
          </div>
        </div>

        {results ? (
          <div className="vsec">
            <div className="sec-head"><h2>'{query}' 검색 결과</h2><span className="more num">{results.length}개</span></div>
            {results.length ? (
              <div className="vlist">{results.map(Row)}</div>
            ) : (
              <div className="search-empty">
                <p>딱 맞는 재료가 없네요</p>
                <span>다른 이름으로 찾아보시거나, 카테고리에서 골라보세요</span>
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

            {cat === 'all' && (
              <>
                <div className="sec-head"><h2>사장님이 많이 담아요</h2><span className="more">더보기 ›</span></div>
                <div className="hscroll">
                  {POPULAR.map((id) => {
                    const p = PRODUCTS[id]
                    return (
                      <div key={id} className="hcard" onClick={() => setSel(id)}>
                        <div className="himg" style={{ background: CATS[p.cat].g }}>
                          <Thumb product={p} iconSize={56} />
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
                <div className="sec-head"><h2>{CATS[sec.cat].label}</h2></div>
                <div className="vlist">{sec.ids.map(Row)}</div>
              </div>
            ))}
          </>
        )}
      </div>

      <button className={`cartbar${build.items.length === 0 ? ' hide' : ''}`} onClick={() => nav('/app/cart')}>
        <div className="cb-left">
          <span className="cb-cart"><Icon name="cart" size={20} stroke={1.8} /><span className="cb-badge num">{build.items.length}</span></span>
          <span className="cb-tx"><span className="l1">장바구니 {build.items.length}개</span><span className="l2 num">식자재 {won(round10(food))}원</span></span>
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
              <div className="ps-img" style={{ background: CATS[selP.cat].g }}><Thumb product={selP} iconSize={44} /></div>
              <div className="ps-head">
                <b>{selP.nm}</b>
                <div className="ps-chips"><span>{selP.origin}</span><span>{selP.spec}</span></div>
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
                      <i className="ps-track"><b style={{ width: `${(real / maxReal) * 100}%` }} /></i>
                      <b className="ps-real num">{won(real)}원</b>
                      <em className="num">수율 {y}%</em>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="ps-raw">조리 손실이 없는 재료예요 · 수율 100% 고정</div>
            )}

            <div className={`ps-trend ${selP.trend[0]}`}>
              {selP.trend[0] === 'dn' && <>지금 평소보다 <b>{selP.trend[1]}% 저렴</b>한 시기예요 — 담기 좋은 때</>}
              {selP.trend[0] === 'up' && <>지금 평소보다 <b>{selP.trend[1]}% 비싼</b> 시기예요 — 대체 재료도 살펴보세요</>}
              {selP.trend[0] === 'fl' && <>시세가 평소 수준이에요</>}
            </div>

            <button className={`ps-add${inBuild(sel) ? ' in' : ''}`} onClick={() => handleToggle(sel)}>
              {inBuild(sel) ? '담겨 있어요 · 누르면 빼요' : '장바구니에 담기'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
