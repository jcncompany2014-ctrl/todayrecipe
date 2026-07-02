import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useStore } from '../state/store'
import { PRODUCTS } from '../data/catalog'
import {
  costOf, yieldOf, summarize, breakeven, won, round10, sig,
  overheadFor, deliveryFeeFor, fixedOverheadFor, marginWithFoodShift, orderPlan, fmtGrams,
} from '../lib/calc'

export default function Result() {
  const nav = useNavigate()
  const { build, dailyFixed, costOpts, setPrice, saveBuild, toast } = useStore()

  // 원가(food)는 판매가와 무관 — 재료가 있으면 실계산, 없으면(저장된 메뉴) 역산값 사용
  const foodFixed = useMemo(
    () => (build.items.length ? summarize(build.items, build.price, costOpts).food : build.fixedFood || 0),
    [build, costOpts]
  )
  const [price, setLocalPrice] = useState(build.price)
  const [orderBowls, setOrderBowls] = useState(50)

  const rate = costOpts.rate
  const fixedCost = foodFixed + fixedOverheadFor(costOpts)   // 판매가와 무관한 부분
  const cost = foodFixed + overheadFor(price, costOpts)      // 배달수수료는 판매가 연동
  const profit = price - cost
  const margin = price > 0 ? Math.round((profit / price) * 100) : 0
  const s = sig(margin)
  const bowls = breakeven(profit, dailyFixed)
  const COOK_VERB = { 볶기: '볶으면', 삶기: '삶으면', 튀김: '튀기면' }

  const minP = round10(fixedCost / (1 - rate))               // 본전 가격 (수수료 정률 반영)
  const maxP = round10(build.price * 1.8)

  // 목표 마진 tm을 맞추는 판매가: price = fixedCost / (1 - rate - tm/100)
  const target = (tm) => {
    const denom = 1 - rate - tm / 100
    return denom > 0 ? Math.ceil(fixedCost / denom / 100) * 100 : null
  }
  const TARGETS = [30, 35, 40]

  // 수율 설명 — 조리로 손실 큰 재료 한 줄 (차별화 보이는 자리)
  const yieldItem = useMemo(() => {
    const cooked = build.items
      .map((it) => ({ it, p: PRODUCTS[it.id], y: yieldOf(it) }))
      .filter((x) => x.p.cookable && x.y < 100)
      .sort((a, b) => a.y - b.y)
    return cooked[0] || null
  }, [build])

  // AI 조언 (규칙 기반, 사람 말투)
  const tips = useMemo(() => {
    const out = []
    if (margin < 20) {
      const tp = target(30)
      if (tp) out.push({ dot: s, html: `마진이 빠듯해요. <b>${won(tp)}원</b>으로 올리면 마진이 30%로 건강해집니다.` })
      else out.push({ dot: s, html: `마진이 빠듯해요. 재료를 줄이거나 판매가를 올려 보세요.` })
    } else if (margin < 30) {
      const tp = target(30)
      if (tp) out.push({ dot: s, html: `조금만 더. <b>${won(tp)}원</b>이면 마진이 30%를 넘겨요.` })
    } else {
      out.push({ dot: 'g', html: `마진이 <b>건강해요(${margin}%)</b>. 이 가격, 자신 있게 받으셔도 됩니다.` })
    }
    const fee = deliveryFeeFor(price, costOpts)
    if (profit > 0 && fee >= profit * 0.25)
      out.push({ dot: 'b', html: `배달앱 수수료가 <b>판매가의 ${Math.round(rate * 100)}%(${won(fee)}원)</b>예요. 포장·매장·자사몰 주문은 이 수수료를 아껴요.` })
    const up = build.items.map((it) => PRODUCTS[it.id]).find((p) => p.trend[0] === 'up')
    const dn = build.items.map((it) => PRODUCTS[it.id]).find((p) => p.trend[0] === 'dn')
    if (up) out.push({ dot: 'w', html: `<b>${up.nm}</b> 시세가 평소보다 ${up.trend[1]}% 비싸요. 다음 발주 땐 대체 재료도 살펴보세요.` })
    else if (dn) out.push({ dot: 'g', html: `<b>${dn.nm}</b>이 평소보다 ${dn.trend[1]}% 저렴해요. 지금이 마진 올리기 좋은 때예요.` })
    return out.slice(0, 3)
  }, [margin, cost, s, price, profit, fixedCost, build, costOpts])

  // 스트레스 테스트: 식자재 원가 변동 시 마진
  const stress = useMemo(() => {
    if (!foodFixed) return []
    return [5, 10, -5].map((pct) => {
      const m = marginWithFoodShift(foodFixed, price, pct, costOpts)
      return { pct, m, d: m - margin, s: sig(m) }
    })
  }, [foodFixed, price, margin, costOpts])

  // 발주 계산
  const plan = useMemo(() => (build.items.length ? orderPlan(build.items, orderBowls) : null), [build, orderBowls])

  const onSave = () => {
    setPrice(price)
    saveBuild(margin)
    toast(`<b>${build.nm}</b> 저장됨 · 마진 ${margin}%로 메뉴판에 올렸어요`)
    setTimeout(() => nav('/app'), 700)
  }

  return (
    <div className="scroll">
      <div className="hd fade">
        <div className="hd-top">
          <button className="iconbtn" aria-label="뒤로" onClick={() => nav(-1)}><Icon name="back" size={22} stroke={2} /></button>
          <h1>마진 결과</h1>
        </div>
        <p className="sub">{build.nm} 원가와 마진이에요</p>
      </div>

      <div className="cards">
        <div className="rcard fade">
          <div className="lab">1그릇 실원가</div>
          <div className="big"><b className="num">₩{won(round10(cost))}</b></div>
        </div>

        <div className="rcard ledger fade" style={{ animationDelay: '.05s' }}>
          <div className="lab">{won(price)}원에 팔면</div>
          <div className="big"><b className={`num ${s === 'g' ? '' : s}`} style={{ color: s === 'g' ? '#5FD6A0' : undefined }}>마진 {margin}%</b></div>
          <hr className="line" />
          <div className="row"><span>1인분 원가</span><b className="num">{won(round10(cost))}원</b></div>
          <div className="row"><span>한 그릇 남는 돈</span><b className="num accent">{won(round10(profit))}원</b></div>
          <div className="ledger-note">내 인건비(880원)까지 비용으로 빼고 남는 사업이익이에요</div>
        </div>

        <div className="rcard fade" style={{ animationDelay: '.1s' }}>
          <div className="lab">이 메뉴로 본전 맞추기</div>
          <div className="big"><b className="num">{bowls === Infinity ? '—' : bowls}</b><span className="unit">그릇</span><span className="sub">팔면 본전</span></div>
          <div className="rcard-calc num">하루 고정비 {won(dailyFixed)}원 ÷ 그릇당 {won(round10(Math.max(0, profit)))}원</div>
        </div>
      </div>

      {/* 수율 설명 (필수 — 차별화) */}
      <div className="yieldnote fade">
        <span className="ic"><Icon name="info" size={18} stroke={1.8} /></span>
        {yieldItem
          ? <p><b>{yieldItem.p.nm}</b>은 {COOK_VERB[yieldItem.it.method] || '조리하면'} {yieldItem.y}%만 남아요. 그만큼 <b>실제 원가</b>가 표기 단가보다 높습니다.</p>
          : <p>조리 <b>수율</b>까지 반영한 실제 원가예요. 원물 단가만 볼 때보다 정확합니다.</p>}
      </div>

      {/* AI 조언 */}
      <div className="advice">
        <div className="advice-head"><span className="tag">AI</span> 사장님께 드리는 조언</div>
        {tips.map((t, i) => (
          <div key={i} className="tip">
            <span className={`dot ${t.dot}-bg`} />
            <p dangerouslySetInnerHTML={{ __html: t.html }} />
          </div>
        ))}
      </div>

      {/* 가격 조정 슬라이더 + 목표 마진 원터치 */}
      <div className="slider fade">
        <div className="slider-top">
          <span className="lab">판매가를 조정해 보세요</span>
          <span className="price num">{won(price)}원</span>
        </div>
        <input type="range" min={minP} max={maxP} step={100} value={Math.min(maxP, Math.max(minP, price))}
          onChange={(e) => setLocalPrice(Number(e.target.value))} />
        <div className="slider-foot"><span className="num">{won(minP)}원</span><span className="num">{won(maxP)}원</span></div>
        <div className="target-chips">
          <span className="tc-lab">목표 마진으로</span>
          {TARGETS.map((tm) => {
            const tp = target(tm)
            if (!tp || tp > maxP) return null
            const active = margin === tm || (tp === price)
            return (
              <button key={tm} className={`tc-chip${active ? ' on' : ''}`}
                onClick={() => { setLocalPrice(tp); toast(`마진 ${tm}%를 받으려면 <b>${won(tp)}원</b>이에요`) }}>
                {tm}%
              </button>
            )
          })}
        </div>
        <div className="slider-res">
          <div className="item"><div className="k">마진</div><div className={`v num ${s}`}>{margin}%</div></div>
          <div className="item"><div className="k">한 그릇 남는 돈</div><div className="v num">{won(round10(profit))}</div></div>
          <div className="item"><div className="k">손익분기</div><div className="v num">{bowls === Infinity ? '—' : bowls}그릇</div></div>
        </div>
      </div>

      {/* 재료값 스트레스 테스트 */}
      {stress.length > 0 && (
        <div className="stress fade">
          <div className="advice-head"><span className="tag">시세</span> 재료값이 출렁이면?</div>
          <div className="stress-rows">
            {stress.map((r) => (
              <div key={r.pct} className="stress-row">
                <span className={`sr-pct num ${r.pct > 0 ? 'b' : 'g'}`}>{r.pct > 0 ? `+${r.pct}%` : `${r.pct}%`}</span>
                <span className="sr-lab">식자재가 {r.pct > 0 ? '오르면' : '내리면'}</span>
                <span className="sr-track"><span className={`${r.s}-bg`} style={{ width: `${Math.max(3, Math.min(100, r.m))}%` }} /></span>
                <b className={`sr-m num ${r.s}`}>{r.m}%</b>
                <span className={`sr-d num ${r.d < 0 ? 'b' : 'g'}`}>{r.d > 0 ? `+${r.d}` : r.d}%p</span>
              </div>
            ))}
          </div>
          <p className="stress-hint">지금 마진 {margin}% 기준 · 시세가 흔들려도 버티는 가격인지 확인하세요</p>
        </div>
      )}

      {/* 발주 계산기 */}
      {plan && (
        <div className="order fade">
          <div className="advice-head"><span className="tag">발주</span> 이만큼 팔 거라면, 얼마나 살까요?</div>
          <div className="order-ctl">
            <span className="oc-lab">예상 판매량</span>
            <div className="stepper oe-stepper">
              <button aria-label="감소" onClick={() => setOrderBowls(Math.max(10, orderBowls - 10))}><Icon name="minus" size={14} stroke={2.4} /></button>
              <span className="v num">{orderBowls}<i>그릇</i></span>
              <button aria-label="증가" onClick={() => setOrderBowls(orderBowls + 10)}><Icon name="plus" size={14} stroke={2.4} /></button>
            </div>
          </div>
          <div className="order-rows">
            {plan.rows.map((r) => (
              <div key={r.id} className="order-row">
                <span className="or-nm">{r.nm}</span>
                <b className="or-g num">{fmtGrams(r.grams)}</b>
                <span className="or-buy num">약 {won(r.buy)}원</span>
              </div>
            ))}
          </div>
          <div className="order-total"><span>예상 식자재 구매비</span><b className="num">약 ₩{won(plan.total)}</b></div>
        </div>
      )}

      <button className="save" onClick={onSave}>이 가격으로 메뉴판에 저장</button>
    </div>
  )
}
