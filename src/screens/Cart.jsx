import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Thumb from '../components/Thumb'
import { useStore } from '../state/store'
import { PRODUCTS, CATS } from '../data/catalog'
import { summarize, costOf, yieldOf, won, round10, COOKS, overheadFor, overheadBreakdown } from '../lib/calc'

export default function Cart() {
  const nav = useNavigate()
  const { build, setGrams, setMethod, setItemPerG, resetItemPerG, removeItem, toast, costOpts, setRate, setPackaging } = useStore()
  const [ovhOpen, setOvhOpen] = useState(false)
  const [bumped, setBumped] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editVal, setEditVal] = useState('')

  const empty = build.items.length === 0
  const { cost, profit, margin, sig } = summarize(build.items, build.price, costOpts)
  const doBump = (id) => { setBumped(id); setTimeout(() => setBumped((b) => (b === id ? null : b)), 150) }
  // 입력 즉시 원가에 반영(라이브). 값이 유효할 때만 반영, 편집창은 blur/Enter로 닫음.
  const onPriceInput = (id, v) => { setEditVal(v); const n = Number(v); if (n > 0) { setItemPerG(id, n); doBump(id) } }

  return (
    <>
      <div className="scroll">
        <div className="hd fade">
          <div className="hd-top">
            <button className="iconbtn" aria-label="뒤로" onClick={() => nav('/app/market')}><Icon name="back" size={22} stroke={2} /></button>
            <h1>장바구니</h1>
          </div>
          <p className="sub">{build.nm} 담는 중 · 재료를 넣으면 마진이 계산돼요</p>
        </div>

        {/* (B) 실시간 마진 요약 */}
        <div className="sum fade" style={{ animationDelay: '.05s' }}>
          <div className="sum-top">
            <div className="m">{build.nm} · 판매가 <b className="num">{won(build.price)}원</b></div>
            <button className="edit" onClick={() => nav('/app/result')}>판매가 조정 ›</button>
          </div>
          {empty ? (
            <div className="sum-empty">재료를 담으면 여기서 <b>예상 마진</b>이 바로 계산돼요</div>
          ) : (
            <>
              <div className="sum-mid">
                <div className="sum-margin"><span className="lab">예상 마진</span><b className={`num ${sig}`}>{margin}%</b></div>
                <div className="sum-stats">
                  <div className="row">1인분 원가<b className="num">{won(round10(cost))}원</b></div>
                  <div className="row">한 그릇 남는 돈<b className="num">{won(round10(profit))}원</b></div>
                </div>
              </div>
              <div className="mbar"><span className={`${sig}b`} style={{ width: `${Math.max(2, Math.min(100, margin))}%` }} /></div>
            </>
          )}
        </div>

        <div className="sec-head"><h2>담은 재료</h2><span className="cnt">{build.items.length}개</span></div>

        {empty ? (
          <div className="cart-empty fade">
            <span className="ce-ic"><Icon name="cart" size={26} stroke={1.7} /></span>
            <p>아직 담은 재료가 없어요<br />마트에서 재료를 담아 오세요</p>
            <button className="ce-btn" onClick={() => nav('/app/market')}>재료 담으러 가기</button>
          </div>
        ) : (
          <>
            {/* (A) 재료별 입력 카드 */}
            <div className="ings">
              {build.items.map((it) => {
                const p = PRODUCTS[it.id]
                return (
                  <div key={it.id} className="ing">
                    <button className="ing-x" aria-label="빼기" onClick={() => { removeItem(it.id); toast(`<b>${p.nm}</b> 뺐어요`) }}>
                      <Icon name="x" size={17} stroke={2} />
                    </button>
                    <div className="ing-top">
                      <div className="vthumb" style={{ background: CATS[p.cat].g }}><Thumb product={p} iconSize={30} /></div>
                      <div className="ing-name">
                        <b>{p.nm}</b>
                        {editId === it.id ? (
                          <span className="ing-price-edit">
                            <input type="number" inputMode="numeric" autoFocus value={editVal}
                              onChange={(e) => onPriceInput(it.id, e.target.value)}
                              onBlur={() => setEditId(null)}
                              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} />
                            <em>원/g</em>
                            <button className="ing-reset" onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { resetItemPerG(it.id); setEditId(null); doBump(it.id) }}>기준가 {p.perG}원</button>
                          </span>
                        ) : (
                          <button className={`ing-price${it.perG != null ? ' on' : ''}`}
                            onClick={() => { setEditId(it.id); setEditVal(String(it.perG != null ? it.perG : p.perG)) }}>
                            {it.perG != null && <i className="ing-mine">내 매입가</i>}
                            {won(it.perG != null ? it.perG : p.perG)}원/g
                            <Icon name="edit" size={10} stroke={2} />
                          </button>
                        )}
                      </div>
                      <div className="ing-cost">
                        <span className="yld">수율 {yieldOf(it)}%</span>
                        <div className={`val num${bumped === it.id ? ' bump' : ''}`}>₩{won(costOf(it))}</div>
                      </div>
                    </div>
                    <div className="ctrl">
                      <span className="ctrl-lab">사용량</span>
                      <div className="stepper">
                        <button aria-label="감소" onClick={() => { setGrams(it.id, it.grams - 10); doBump(it.id) }}><Icon name="minus" size={16} stroke={2.4} /></button>
                        <span className="v num">{it.grams}<i>g</i></span>
                        <button aria-label="증가" onClick={() => { setGrams(it.id, it.grams + 10); doBump(it.id) }}><Icon name="plus" size={16} stroke={2.4} /></button>
                      </div>
                    </div>
                    <div className="ctrl">
                      <span className="ctrl-lab">조리</span>
                      {p.cookable ? (
                        <div className="cooks">
                          {COOKS.map((k) => (
                            <button key={k} className={`cook${it.method === k ? ' on' : ''}`}
                              onClick={() => { setMethod(it.id, k); doBump(it.id) }}>{k}</button>
                          ))}
                        </div>
                      ) : (
                        <span className="raw">생 그대로 · 수율 100%</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="addmore" onClick={() => nav('/app/market')}>
              <Icon name="plus" size={18} stroke={2} /> 재료 더 담기
            </button>
          </>
        )}

        {/* 부대비용 (판매가·가게 설정 연동 — 사장님이 직접 조절) */}
        <div className={`ovh${ovhOpen ? ' open' : ''}`}>
          <div className="ovh-head" onClick={() => setOvhOpen((v) => !v)}>
            <div className="l"><b>부대비용</b><span>배달수수료·포장·인건비 — 우리 가게 기준으로 조절</span></div>
            <div className="r"><b className="num">{won(overheadFor(build.price, costOpts))}원</b><Icon name="chevD" size={18} stroke={2} className="chev" /></div>
          </div>
          <div className="ovh-body">
            {overheadBreakdown(build.price, costOpts).map((r) => (
              <div key={r.k} className="ovh-row"><span>{r.k}</span><b className="num">{won(r.v)}원</b></div>
            ))}
            <div className="ovh-edit">
              <div className="oe-row">
                <span className="oe-lab">배달앱 수수료율</span>
                <input type="range" min="0" max="18" step="1" value={Math.round(costOpts.rate * 100)}
                  onChange={(e) => setRate(Number(e.target.value) / 100)} aria-label="배달앱 수수료율" />
                <b className="num oe-val">{Math.round(costOpts.rate * 100)}%</b>
              </div>
              <div className="oe-row">
                <span className="oe-lab">포장비</span>
                <div className="stepper oe-stepper">
                  <button aria-label="감소" onClick={() => setPackaging(costOpts.packaging - 100)}><Icon name="minus" size={14} stroke={2.4} /></button>
                  <span className="v num">{won(costOpts.packaging)}<i>원</i></span>
                  <button aria-label="증가" onClick={() => setPackaging(costOpts.packaging + 100)}><Icon name="plus" size={14} stroke={2.4} /></button>
                </div>
              </div>
              <p className="oe-hint">배달앱 요금제, 용기값이 가게마다 달라요. 바꾸면 마진이 바로 다시 계산돼요.</p>
            </div>
          </div>
        </div>
      </div>

      {empty ? (
        <button className="cta" onClick={() => nav('/app/market')}>
          <b>재료 담으러 가기</b>
          <span className="r"><Icon name="chevR" size={18} stroke={2.2} /></span>
        </button>
      ) : (
        <button className="cta" onClick={() => nav('/app/result')}>
          <b>마진 확정하기</b>
          <span className="r">1인분 <span className="num">{won(round10(cost))}원</span><Icon name="chevR" size={18} stroke={2.2} /></span>
        </button>
      )}
    </>
  )
}
