import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useStore } from '../state/store'
import { won } from '../lib/calc'
import '../styles/menu2.css'

/* ── 메뉴 시트 공용 도구 ───────────────────────────────────────────── */

// 토스트는 HTML로 그려진다 — 사장님이 친 메뉴 이름은 반드시 이스케이프
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// 숫자만 남긴다(쉼표·'원'·공백 등) — 최대 7자리(999만 원)
export const onlyDigits = (v) => String(v ?? '').replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 7)
export const commas = (d) => (d ? Number(d).toLocaleString('ko-KR') : '')

export const NAME_MAX = 24
export const PRICE_MIN = 500
export const PRICE_MAX = 1000000
export const DEFAULT_PRICE = 9000

export function priceError(d, { required = false } = {}) {
  if (!d) return required ? '판매가를 넣어 주세요' : ''
  const n = Number(d)
  if (n < PRICE_MIN) return `판매가가 너무 낮아요 · ${won(PRICE_MIN)}원 이상으로 넣어 주세요`
  if (n > PRICE_MAX) return `판매가가 너무 높아요 · ${won(PRICE_MAX)}원 이하로 넣어 주세요`
  return ''
}

/* 시트 껍데기 — body 로 포털해서 position:fixed.
   사이드바(.screen 밖)·탭바·메뉴판 어디서 열어도 같은 자리, PC 에선 가운데 대화상자. */
export function Mn2Sheet({ title, lead, onClose, children }) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeRef.current() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="mn2-wrap" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="mn2-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="mn2-grab" aria-hidden="true" />
        <div className="mn2-head">
          <h2>{title}</h2>
          <button type="button" className="mn2-x" aria-label="닫기" onClick={onClose}><Icon name="x" size={19} stroke={2.2} /></button>
        </div>
        {lead && <p className="mn2-lead">{lead}</p>}
        {children}
      </div>
    </div>,
    document.body
  )
}

/* ── 새 메뉴 시트 ────────────────────────────────────────────────────
   예전엔 + 를 누르면 이름 '새 메뉴'·9,000원으로 바로 마트로 갔다.
   사장님이 자기 메뉴 이름을 붙일 길이 없었다. */
const QUICK_PRICES = [6000, 8000, 9000, 10000, 12000]

export default function NewMenuSheet({ open, onClose }) {
  if (!open) return null
  return <NewMenuForm onClose={onClose} />
}

function NewMenuForm({ onClose }) {
  const nav = useNavigate()
  const { newBuild, menus, toast } = useStore()
  const [nm, setNm] = useState('')
  const [price, setPriceD] = useState('')
  const [tried, setTried] = useState(false)
  const nameRef = useRef(null)

  // 폰에서 키보드가 시트 애니메이션과 겹치지 않게 한 박자 뒤에 포커스
  useEffect(() => {
    const t = setTimeout(() => nameRef.current && nameRef.current.focus(), 120)
    return () => clearTimeout(t)
  }, [])

  const name = nm.trim()
  const nameErr = !name ? '메뉴 이름을 넣어 주세요' : ''
  const pErr = priceError(price)
  const dup = name && (menus || []).some((m) => (m.nm || '').trim() === name)

  const submit = (e) => {
    e.preventDefault()
    setTried(true)
    if (nameErr || pErr) {
      if (nameErr && nameRef.current) nameRef.current.focus()
      return
    }
    const p = price ? Number(price) : DEFAULT_PRICE
    newBuild({ nm: name, price: p })
    onClose()
    nav('/app/market')
    toast(`<b>${esc(name)}</b> · 들어가는 재료를 담아 주세요`)
  }

  return (
    <Mn2Sheet title="새 메뉴 만들기" lead="이름과 가격만 정하면 바로 재료를 담으러 가요" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="mn2-field">
          <label className="mn2-lab" htmlFor="mn2-new-name"><span>메뉴 이름<i className="req" aria-hidden="true">*</i></span><em>{name.length}/{NAME_MAX}</em></label>
          <div className={`mn2-input${tried && nameErr ? ' bad' : ''}`}>
            <input
              id="mn2-new-name" ref={nameRef} value={nm} maxLength={NAME_MAX} placeholder="예: 제육덮밥"
              enterKeyHint="next" autoComplete="off"
              aria-invalid={tried && !!nameErr}
              onChange={(e) => setNm(e.target.value)}
            />
          </div>
          {tried && nameErr && <p className="mn2-err" role="alert">{nameErr}</p>}
          {!nameErr && dup && <p className="mn2-help">같은 이름의 메뉴가 이미 있어요 · 그래도 만들 수 있어요</p>}
        </div>

        <div className="mn2-field">
          <label className="mn2-lab" htmlFor="mn2-new-price"><span>판매가</span><em>몰라도 괜찮아요</em></label>
          <div className={`mn2-input${pErr && (tried || price.length >= 3) ? ' bad' : ''}`}>
            <input
              id="mn2-new-price" className="num" inputMode="numeric" pattern="[0-9]*" autoComplete="off" enterKeyHint="go"
              placeholder={won(DEFAULT_PRICE)} value={commas(price)}
              aria-invalid={!!pErr}
              onChange={(e) => setPriceD(onlyDigits(e.target.value))}
            />
            <span className="mn2-unit">원</span>
          </div>
          {pErr && (tried || price.length >= 3)
            ? <p className="mn2-err" role="alert">{pErr}</p>
            : <p className="mn2-help">비워 두면 {won(DEFAULT_PRICE)}원으로 시작해요. 원가를 보고 나서 정해도 돼요.</p>}
          <div className="mn2-chips" role="group" aria-label="자주 쓰는 가격">
            {QUICK_PRICES.map((v) => (
              <button type="button" key={v} className={`mn2-chip${Number(price) === v ? ' on' : ''}`}
                aria-pressed={Number(price) === v}
                onClick={() => setPriceD(Number(price) === v ? '' : String(v))}>
                {won(v)}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="mn2-go">
          재료 담으러 가기<Icon name="chevR" size={18} stroke={2.4} />
        </button>
        <p className="mn2-sub">재료를 담으면 이 메뉴의 진짜 원가와 마진이 나와요</p>
      </form>
    </Mn2Sheet>
  )
}
