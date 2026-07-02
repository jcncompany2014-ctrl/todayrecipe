import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useStore } from '../state/store'
import { PRODUCTS } from '../data/catalog'
import {
  costOf, yieldOf, summarize, breakeven, won, round10, sig,
  overheadFor, deliveryFeeFor, fixedOverheadFor, marginWithFoodShift, orderPlan, fmtGrams,
  costSegments, bestSubstitutions, diagnose,
} from '../lib/calc'
import { exportReceipt } from '../lib/receipt'

// 원가 도넛 색 램프 — 재료는 그린, 부대비용은 웜/뉴트럴 (원물 vs 부대 한눈에)
const ING_RAMP = ['#0C2B1E', '#1C5B3D', '#2E8B57', '#49B27E', '#79CDA3', '#A9E3C4']
const OVH_RAMP = ['#C58A4A', '#D6A970', '#B9AE9F', '#9E958A']

function CostDonut({ data }) {
  const { segments, total } = data
  let ingI = 0, ovhI = 0
  const segs = segments.map((s) => ({
    ...s,
    color: s.type === 'ing' ? ING_RAMP[Math.min(ingI++, ING_RAMP.length - 1)] : OVH_RAMP[Math.min(ovhI++, OVH_RAMP.length - 1)],
  }))
  const size = 170, sw = 27, r = (size - sw) / 2, cx = size / 2, C = 2 * Math.PI * r
  let acc = 0
  const arcs = segs.map((s, i) => {
    const len = total > 0 ? (s.v / total) * C : 0
    const off = -acc
    acc += len
    return <circle key={i} cx={cx} cy={cx} r={r} fill="none" stroke={s.color} strokeWidth={sw}
      strokeDasharray={`${len} ${C - len}`} strokeDashoffset={off} strokeLinecap="butt" />
  })
  return (
    <div className="cv-wrap">
      <div className="cv-donut">
        <svg viewBox={`0 0 ${size} ${size}`} width="132" height="132">
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--track)" strokeWidth={sw} />
          <g transform={`rotate(-90 ${cx} ${cx})`}>{arcs}</g>
        </svg>
        <div className="cv-center"><span>1그릇 원가</span><b className="num">{won(total)}</b></div>
      </div>
      <div className="cv-legend">
        {segs.map((s, i) => (
          <div key={i} className="cv-li">
            <span className="cv-dot" style={{ background: s.color }} />
            <span className="cv-lb">{s.label.replace(/\s*\(\d+%\)/, '').replace('배달앱 수수료', '배달 수수료').replace('조리 인건비', '인건비')}</span>
            <b className="cv-v num">{won(s.v)}</b>
            <span className="cv-pct num">{Math.round((s.v / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Result() {
  const nav = useNavigate()
  const { build, dailyFixed, costOpts, setPrice, saveBuild, toast } = useStore()
  const hasItems = build.items.length > 0

  const foodFixed = useMemo(
    () => (hasItems ? summarize(build.items, build.price, costOpts).food : build.fixedFood || 0),
    [build, costOpts, hasItems]
  )
  const [price, setLocalPrice] = useState(build.price)
  const [orderBowls, setOrderBowls] = useState(50)
  const [busy, setBusy] = useState(null)

  const rate = costOpts.rate
  const fixedCost = foodFixed + fixedOverheadFor(costOpts)
  const cost = foodFixed + overheadFor(price, costOpts)
  const profit = price - cost
  const margin = price > 0 ? Math.round((profit / price) * 100) : 0
  const s = sig(margin)
  const bowls = breakeven(profit, dailyFixed)
  const COOK_VERB = { 볶기: '볶으면', 삶기: '삶으면', 튀김: '튀기면' }

  const minP = round10(fixedCost / (1 - rate))
  const maxP = round10(build.price * 1.8)

  const target = (tm) => {
    const denom = 1 - rate - tm / 100
    return denom > 0 ? Math.ceil(fixedCost / denom / 100) * 100 : null
  }
  const TARGETS = [30, 35, 40]

  const yieldItem = useMemo(() => {
    const cooked = build.items
      .map((it) => ({ it, p: PRODUCTS[it.id], y: yieldOf(it) }))
      .filter((x) => x.p.cookable && x.y < 100)
      .sort((a, b) => a.y - b.y)
    return cooked[0] || null
  }, [build])

  // 원가 구성 (판매가 연동 — 슬라이더 움직이면 부대비용도 반영)
  const segData = useMemo(() => (hasItems ? costSegments(build.items, price, costOpts) : null), [build, price, costOpts, hasItems])

  // AI 마진 진단 (규칙 기반) — 현재 판매가 기준
  const diag = useMemo(() => (hasItems ? diagnose({ ...build, price }, costOpts, dailyFixed) : null), [build, price, costOpts, dailyFixed, hasItems])

  // 재료 대체 추천 (상위 3)
  const subs = useMemo(() => (hasItems ? bestSubstitutions(build.items, price, costOpts).slice(0, 3) : []), [build, price, costOpts, hasItems])

  // 저장 메뉴(재료 없음) 폴백용 간단 조언
  const tips = useMemo(() => {
    const out = []
    if (margin < 20) {
      const tp = target(30)
      out.push({ dot: s, html: tp ? `마진이 빠듯해요. <b>${won(tp)}원</b>으로 올리면 마진이 30%로 건강해집니다.` : `마진이 빠듯해요. 재료를 줄이거나 판매가를 올려 보세요.` })
    } else if (margin < 30) {
      const tp = target(30)
      if (tp) out.push({ dot: s, html: `조금만 더. <b>${won(tp)}원</b>이면 마진이 30%를 넘겨요.` })
    } else {
      out.push({ dot: 'g', html: `마진이 <b>건강해요(${margin}%)</b>. 이 가격, 자신 있게 받으셔도 됩니다.` })
    }
    return out
  }, [margin, s, price, fixedCost])

  const stress = useMemo(() => {
    if (!foodFixed) return []
    return [5, 10, -5].map((pct) => {
      const m = marginWithFoodShift(foodFixed, price, pct, costOpts)
      return { pct, m, d: m - margin, s: sig(m) }
    })
  }, [foodFixed, price, margin, costOpts])

  const plan = useMemo(() => (hasItems ? orderPlan(build.items, orderBowls) : null), [build, orderBowls, hasItems])

  const onSave = () => {
    setPrice(price)
    saveBuild(margin)
    toast(`<b>${build.nm}</b> 저장됨 · 마진 ${margin}%로 메뉴판에 올렸어요`)
    setTimeout(() => nav('/app'), 700)
  }

  const onExport = async (mode) => {
    if (busy) return
    setBusy(mode)
    try {
      const receipt = {
        nm: build.nm, price, margin, cost: round10(cost), bowls, dailyFixed,
        date: new Date().toLocaleDateString('ko-KR'),
        ings: segData.segments.filter((x) => x.type === 'ing'),
        ovh: segData.segments.filter((x) => x.type === 'ovh'),
        ingTotal: segData.ingTotal, ovhTotal: segData.ovhTotal,
      }
      const r = await exportReceipt(receipt, mode)
      toast(r === 'saved' ? '명세서 이미지를 저장했어요' : r === 'shared' ? '명세서를 공유했어요' : r === 'print' ? '인쇄 창을 열었어요' : '취소했어요')
    } catch (e) {
      toast('이미지를 만들지 못했어요. 다시 시도해 주세요')
    } finally {
      setBusy(null)
    }
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

      {/* 원가 구성 시각화 */}
      {segData && segData.total > 0 && (
        <div className="viz fade">
          <div className="advice-head"><span className="tag"><Icon name="pie" size={13} stroke={0} fill /></span> 원가는 어디에 쓰이나요</div>
          <CostDonut data={segData} />
          <p className="viz-hint">재료 <b className="num">{won(segData.ingTotal)}원</b> · 부대비용 <b className="num">{won(segData.ovhTotal)}원</b> — 배달·포장·인건비가 생각보다 커요</p>
        </div>
      )}

      {/* 수율 설명 (차별화) */}
      <div className="yieldnote fade">
        <span className="ic"><Icon name="info" size={18} stroke={1.8} /></span>
        {yieldItem
          ? <p><b>{yieldItem.p.nm}</b>은 {COOK_VERB[yieldItem.it.method] || '조리하면'} {yieldItem.y}%만 남아요. 그만큼 <b>실제 원가</b>가 표기 단가보다 높습니다.</p>
          : <p>조리 <b>수율</b>까지 반영한 실제 원가예요. 원물 단가만 볼 때보다 정확합니다.</p>}
      </div>

      {/* AI 마진 진단 */}
      {diag ? (
        <div className="diag fade">
          <div className="advice-head"><span className="tag"><Icon name="sparkle" size={12} stroke={0} fill /> AI</span> 마진 진단</div>
          <div className={`diag-verdict ${diag.level}`}>
            <span className={`dv-dot ${diag.level}-bg`} />
            <div className="dv-tx"><b>{diag.title}</b><span>{diag.line}</span></div>
            <div className={`dv-m num ${diag.level}`}>{diag.margin}%</div>
          </div>
          {diag.actions.length > 0 && (
            <>
              <div className="diag-lab">{diag.actionsLabel}</div>
              <div className="diag-acts">
                {diag.actions.map((a, i) => (
                  <div key={i} className="da">
                    <span className="da-ic"><Icon name={a.icon} size={16} stroke={1.9} /></span>
                    <span className="da-tx">{a.label}</span>
                    <b className="da-eff num">{a.effect}</b>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="advice">
          <div className="advice-head"><span className="tag">AI</span> 사장님께 드리는 조언</div>
          {tips.map((t, i) => (
            <div key={i} className="tip"><span className={`dot ${t.dot}-bg`} /><p dangerouslySetInnerHTML={{ __html: t.html }} /></div>
          ))}
        </div>
      )}

      {/* 재료 대체 추천 */}
      {subs.length > 0 && (
        <div className="subs fade">
          <div className="advice-head"><span className="tag"><Icon name="swap" size={13} stroke={2} /></span> 이렇게 바꾸면 원가가 줄어요</div>
          <div className="subs-list">
            {subs.map((b) => (
              <div key={b.fromId} className="sub-row">
                <div className="sr-swap">
                  <span className="sr-from">{b.fromNm}</span>
                  <Icon name="chevR" size={15} stroke={2.2} />
                  <span className="sr-to">{b.toNm}</span>
                </div>
                <div className="sr-delta">
                  <span className="sr-cost num">원가 {won(b.costDelta)}원</span>
                  <b className="sr-m num g">마진 +{b.marginDelta}%p</b>
                </div>
              </div>
            ))}
          </div>
          <p className="subs-hint">같은 분류의 더 싼 재료예요 · 원가만 비교했으니 맛은 사장님이 판단하세요</p>
        </div>
      )}

      {/* 가격 조정 슬라이더 + 목표 마진 */}
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

      {/* 스트레스 테스트 */}
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

      {/* 원가 명세서 내보내기 */}
      {segData && (
        <div className="receipt fade">
          <div className="rc-info">
            <span className="rc-ic"><Icon name="receipt" size={20} stroke={1.8} /></span>
            <div className="rc-tx"><b>원가 명세서</b><span>이미지로 저장해 장부에 붙이거나 직원과 공유하세요</span></div>
          </div>
          <div className="rc-btns">
            <button disabled={!!busy} onClick={() => onExport('save')}><Icon name="download" size={17} stroke={2} />{busy === 'save' ? '만드는 중…' : '이미지 저장'}</button>
            <button disabled={!!busy} onClick={() => onExport('share')}><Icon name="share" size={16} stroke={2} />공유</button>
            <button disabled={!!busy} onClick={() => onExport('print')}><Icon name="print" size={17} stroke={2} />인쇄</button>
          </div>
        </div>
      )}

      <button className="save" onClick={onSave}>이 가격으로 메뉴판에 저장</button>
    </div>
  )
}
