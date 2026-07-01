import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Thumb from '../components/Thumb'
import { useStore } from '../state/store'
import { PRODUCTS, CATS } from '../data/catalog'
import { summarize, costOf, yieldOf, won, round10, COOKS, OVERHEAD, OVERHEAD_BREAKDOWN } from '../lib/calc'

export default function Cart() {
  const nav = useNavigate()
  const { build, setGrams, setMethod, removeItem, toast } = useStore()
  const [ovhOpen, setOvhOpen] = useState(false)
  const [bumped, setBumped] = useState(null)

  const { cost, profit, margin, sig } = summarize(build.items, build.price)
  const doBump = (id) => { setBumped(id); setTimeout(() => setBumped((b) => (b === id ? null : b)), 150) }

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
            <button className="edit" onClick={() => toast('판매가는 결과 화면 슬라이더로 조정해요')}>판매가 수정</button>
          </div>
          <div className="sum-mid">
            <div className="sum-margin"><span className="lab">예상 마진</span><b className={`num ${sig}`}>{margin}%</b></div>
            <div className="sum-stats">
              <div className="row">1인분 원가<b className="num">{won(round10(cost))}원</b></div>
              <div className="row">한 그릇 남는 돈<b className="num">{won(round10(profit))}원</b></div>
            </div>
          </div>
          <div className="mbar"><span className={`${sig}b`} style={{ width: `${Math.max(2, Math.min(100, margin))}%` }} /></div>
        </div>

        <div className="sec-head"><h2>담은 재료</h2><span className="cnt">{build.items.length}개</span></div>

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
                  <div className="ing-name"><b>{p.nm}</b><span>{p.perG}원/g</span></div>
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

        {/* 부대비용 */}
        <div className={`ovh${ovhOpen ? ' open' : ''}`}>
          <div className="ovh-head" onClick={() => setOvhOpen((v) => !v)}>
            <div className="l"><b>부대비용</b><span>배달수수료·포장·인건비 등</span></div>
            <div className="r"><b className="num">{won(OVERHEAD)}원</b><Icon name="chevD" size={18} stroke={2} className="chev" /></div>
          </div>
          <div className="ovh-body">
            {OVERHEAD_BREAKDOWN.map((r) => (
              <div key={r.k} className="ovh-row"><span>{r.k}</span><b className="num">{won(r.v)}원</b></div>
            ))}
          </div>
        </div>
      </div>

      <button className="cta" onClick={() => nav('/app/result')}>
        <b>마진 확정하기</b>
        <span className="r">1인분 <span className="num">{won(round10(cost))}원</span><Icon name="chevR" size={18} stroke={2.2} /></span>
      </button>
    </>
  )
}
