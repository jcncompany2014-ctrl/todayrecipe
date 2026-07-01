import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useStore } from '../state/store'
import { PRODUCTS } from '../data/catalog'
import { costOf, yieldOf, summarize, breakeven, won, round10, sig, OVERHEAD } from '../lib/calc'

export default function Result() {
  const nav = useNavigate()
  const { build, dailyFixed, setPrice, saveBuild, toast } = useStore()

  // 원가(food)는 판매가와 무관 — 재료가 있으면 실계산, 없으면(저장된 메뉴) 역산값 사용
  const foodFixed = useMemo(
    () => (build.items.length ? summarize(build.items, build.price).food : build.fixedFood || 0),
    [build]
  )
  const [price, setLocalPrice] = useState(build.price)

  const cost = foodFixed + OVERHEAD
  const profit = price - cost
  const margin = price > 0 ? Math.round((profit / price) * 100) : 0
  const s = sig(margin)
  const bowls = breakeven(profit, dailyFixed)
  const COOK_VERB = { 볶기: '볶으면', 삶기: '삶으면', 튀김: '튀기면' }

  const minP = round10(cost)               // 본전 가격
  const maxP = round10(build.price * 1.8)

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
    const target = (tm) => Math.ceil(cost / (1 - tm / 100) / 100) * 100
    if (margin < 20) {
      const tp = target(30), nm = Math.round((tp - cost) / tp * 100)
      out.push({ dot: s, html: `마진이 빠듯해요. <b>${won(tp)}원</b>으로 올리면 마진 ${nm}%로 건강해집니다.` })
    } else if (margin < 30) {
      const tp = target(30), nm = Math.round((tp - cost) / tp * 100)
      out.push({ dot: s, html: `조금만 더. <b>${won(tp)}원</b>이면 마진이 ${nm}%로 30%를 넘겨요.` })
    } else {
      out.push({ dot: 'g', html: `마진이 <b>건강해요(${margin}%)</b>. 이 가격, 자신 있게 받으셔도 됩니다.` })
    }
    const share = Math.round((1080 / cost) * 100)
    if (share >= 18) out.push({ dot: 'b', html: `배달 수수료가 원가의 <b>${share}%</b>를 먹고 있어요 — 매장·포장 유도가 답일 수 있어요.` })
    const up = build.items.map((it) => PRODUCTS[it.id]).find((p) => p.trend[0] === 'up')
    const dn = build.items.map((it) => PRODUCTS[it.id]).find((p) => p.trend[0] === 'dn')
    if (up) out.push({ dot: 'w', html: `<b>${up.nm}</b> 시세가 평소보다 ${up.trend[1]}% 비싸요. 다음 발주 땐 대체 재료도 살펴보세요.` })
    else if (dn) out.push({ dot: 'g', html: `<b>${dn.nm}</b>이 평소보다 ${dn.trend[1]}% 저렴해요. 지금이 마진 올리기 좋은 때예요.` })
    return out.slice(0, 3)
  }, [margin, cost, s, build])

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
        <p className="sub">{build.nm} · 수율까지 반영한 진짜 원가예요</p>
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
          ? <p><b>{yieldItem.p.nm}</b>은 {COOK_VERB[yieldItem.it.method] || '조리하면'} {yieldItem.y}%만 남아서, 표기 단가보다 실제 원가가 높아요. 그래서 더 정확합니다.</p>
          : <p>조리 <b>수율</b>까지 반영해 실제 원가를 계산했어요. 원물 단가만 보는 것보다 정확합니다.</p>}
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

      {/* 가격 조정 슬라이더 */}
      <div className="slider fade">
        <div className="slider-top">
          <span className="lab">판매가를 조정해 보세요</span>
          <span className="price num">{won(price)}원</span>
        </div>
        <input type="range" min={minP} max={maxP} step={100} value={price}
          onChange={(e) => setLocalPrice(Number(e.target.value))} />
        <div className="slider-foot"><span className="num">{won(minP)}원</span><span className="num">{won(maxP)}원</span></div>
        <div className="slider-res">
          <div className="item"><div className="k">마진</div><div className={`v num ${s}`}>{margin}%</div></div>
          <div className="item"><div className="k">한 그릇 남는 돈</div><div className="v num">{won(round10(profit))}</div></div>
          <div className="item"><div className="k">손익분기</div><div className="v num">{bowls === Infinity ? '—' : bowls}그릇</div></div>
        </div>
      </div>

      <button className="save" onClick={onSave}>이 가격으로 메뉴판에 저장</button>
    </div>
  )
}
