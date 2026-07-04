import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import { useStore } from '../state/store'
import { won, sig } from '../lib/calc'

const round100 = (n) => Math.round(n / 100) * 100

/* 세트·콤보 메뉴 — 여러 메뉴를 묶어 세트가를 정하고, 할인이 마진을 얼마나 깎는지 바로 확인. */
export default function Combo() {
  const nav = useNavigate()
  const { menus } = useStore()
  const [picked, setPicked] = useState([])
  const [price, setPrice] = useState(0)
  const [touched, setTouched] = useState(false)

  const toggle = (id) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
    setTouched(false) // 다시 추천가에 맞춤
  }

  const chosen = picked.map((id) => menus.find((m) => m.id === id)).filter(Boolean)
  const sumPrice = chosen.reduce((a, m) => a + m.price, 0)
  const sumProfit = chosen.reduce((a, m) => a + Math.round((m.price * m.margin) / 100), 0)
  const sumCost = sumPrice - sumProfit // 낱개 원가 합

  const suggested = round100(sumPrice * 0.9) // 기본 10% 할인
  // 아직 세트가를 직접 안 건드렸으면 추천가를 따라간다(메뉴 조합 바뀌면 재동기화).
  useEffect(() => { if (!touched) setPrice(suggested) }, [suggested, touched])

  const discount = Math.max(0, sumPrice - price)
  const discountPct = sumPrice > 0 ? Math.round((discount / sumPrice) * 100) : 0
  const comboProfit = price - sumCost
  const comboMargin = price > 0 ? Math.round((comboProfit / price) * 100) : 0
  const baseMargin = sumPrice > 0 ? Math.round((sumProfit / sumPrice) * 100) : 0
  // 마진 30% 지키는 최저 세트가
  const minPrice30 = round100(sumCost / 0.7)
  const maxDiscount = Math.max(0, sumPrice - minPrice30)
  const s = sig(comboMargin)

  const bump = (d) => { setTouched(true); setPrice((p) => Math.max(0, round100(p + d))) }
  const ready = chosen.length >= 2

  return (
    <div className="scroll">
      <div className="hd fade">
        <div className="hd-top">
          <button className="iconbtn" aria-label="뒤로" onClick={() => nav('/app')}><Icon name="back" size={22} stroke={2} /></button>
          <h1>세트·콤보 메뉴</h1>
        </div>
        <p className="sub">메뉴를 묶어 세트가를 정하면 마진이 어떻게 되는지 보여드려요</p>
      </div>

      <div className="menu-sec-head"><h2>묶을 메뉴 고르기 <span className="cmb-badge num">{chosen.length}</span></h2></div>
      <div className="cmb-pick">
        {menus.map((m) => {
          const on = picked.includes(m.id)
          return (
            <button key={m.id} className={`cmb-item${on ? ' on' : ''}`} onClick={() => toggle(m.id)}>
              <div className="cmb-photo"><Photo src={m.img} icon={m.icon} iconSize={20} alt={m.nm} /></div>
              <div className="cmb-info"><b>{m.nm}</b><span className="num">{won(m.price)}원</span></div>
              <span className={`cmb-check${on ? ' on' : ''}`}>{on && <Icon name="check" size={13} stroke={2.6} />}</span>
            </button>
          )
        })}
      </div>

      {!ready ? (
        <div className="cmb-empty fade">
          <Icon name="cart" size={26} stroke={1.6} />
          <p>메뉴를 <b>2개 이상</b> 골라주세요</p>
        </div>
      ) : (
        <div className="cmb-result fade">
          <div className="cmb-names">{chosen.map((m) => m.nm).join(' + ')}</div>

          <div className="cmb-compare">
            <div className="cmc-col">
              <span className="cmc-lab">낱개로 팔면</span>
              <b className="cmc-price num">{won(sumPrice)}원</b>
              <span className="cmc-sub">마진 {baseMargin}%</span>
            </div>
            <div className="cmc-arrow"><Icon name="chevR" size={18} stroke={2} /></div>
            <div className="cmc-col hi">
              <span className="cmc-lab">세트가</span>
              <b className="cmc-price num">{won(price)}원</b>
              <span className={`cmc-sub ${s}`}>마진 {comboMargin}%</span>
            </div>
          </div>

          <div className="cmb-steprow">
            <span className="cmb-steplab">세트가 조정</span>
            <div className="oe-stepper">
              <button aria-label="500원 내리기" onClick={() => bump(-500)}><Icon name="minus" size={14} stroke={2.4} /></button>
              <span className="v num">{won(price)}</span>
              <button aria-label="500원 올리기" onClick={() => bump(500)}><Icon name="plus" size={14} stroke={2.4} /></button>
            </div>
          </div>

          <div className={`cmb-gauge ${s}`}>
            <span className="cmb-gfill" style={{ width: `${Math.max(3, Math.min(100, comboMargin * 2))}%` }} />
          </div>

          <ul className="cmb-lines">
            <li><span>손님 할인 혜택</span><b className="num g">{won(discount)}원 ({discountPct}%)</b></li>
            <li><span>세트 원가 (재료·부대비 합)</span><b className="num">{won(sumCost)}원</b></li>
            <li><span>세트 1개당 남는 돈</span><b className={`num ${comboProfit >= 0 ? 'g' : 'b'}`}>{comboProfit >= 0 ? '+' : '−'}{won(Math.abs(comboProfit))}원</b></li>
          </ul>

          <div className={`cmb-tip ${s}`}>
            {comboMargin < 20
              ? <>할인이 너무 커요. 마진 30%를 지키려면 세트가를 <b>{won(minPrice30)}원</b> 이상으로 두세요.</>
              : comboMargin < 30
                ? <>조금 빠듯해요. <b>{won(minPrice30)}원</b>까지만 할인해도 마진 30%를 지킬 수 있어요.</>
                : <>여유 있어요. 마진 30%를 지키는 선에서 최대 <b>{won(maxDiscount)}원</b>까지 더 깎아줄 수 있어요.</>}
          </div>
        </div>
      )}
    </div>
  )
}
