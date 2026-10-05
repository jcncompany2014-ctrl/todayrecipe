import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Photo from './Photo'
import { Mn2Sheet, esc, onlyDigits, commas, priceError, NAME_MAX } from './NewMenuSheet'
import { useStore } from '../state/store'
import { won, sig, overheadFor, profitOf } from '../lib/calc'
import '../styles/menu2.css'

/* 메뉴 편집 시트 — 이름·판매가·사진 수정, 복제, 삭제.
   판매가를 바꾸면 저장된 마진은 옛 가격 기준이 된다.
   같은 원가(식자재)로 새 가격의 마진을 다시 어림해 함께 저장하고,
   정확한 값은 결과 화면에서 다시 계산하도록 길을 열어 둔다. */
export default function MenuEditSheet({ menu, onClose }) {
  const nav = useNavigate()
  const { updateMenu, duplicateMenu, deleteMenu, loadMenu, setPrice, costOpts, safeMargin, toast } = useStore()

  const oldPrice = Number(menu?.price) > 0 ? Math.round(Number(menu.price)) : 0
  const oldMargin = Number.isFinite(Number(menu?.margin)) ? Math.round(Number(menu.margin)) : 0

  const [nm, setNm] = useState(menu?.nm || '')
  const [price, setPriceD] = useState(oldPrice ? String(oldPrice) : '')
  const [img, setImg] = useState(menu?.img || null)
  const [tried, setTried] = useState(false)
  const fileRef = useRef(null)

  if (!menu) return null

  const name = nm.trim()
  const nameErr = !name ? '메뉴 이름을 넣어 주세요' : ''
  const pErr = priceError(price, { required: true })
  const newPrice = pErr ? oldPrice : Number(price)
  const priceChanged = !pErr && newPrice !== oldPrice

  // 같은 식자재 원가로 새 가격의 남는 돈·마진을 어림 — loadMenu 의 역산과 같은 식
  const est = (() => {
    if (!priceChanged || !oldPrice || newPrice <= 0) return { margin: oldMargin, profit: null }
    const opts = costOpts || {}
    const food = Math.max(0, Math.round(oldPrice - profitOf(menu)) - overheadFor(oldPrice, opts))
    const profit = Math.round(newPrice - (food + overheadFor(newPrice, opts)))
    return { margin: Math.round((profit / newPrice) * 100), profit }
  })()
  const estMargin = est.margin
  const safePct = safeMargin && Number.isFinite(safeMargin.pct) ? safeMargin.pct : 30
  const sOld = sig(oldMargin, safePct)
  const sNew = sig(estMargin, safePct)

  const pickPhoto = (e) => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''   // 같은 사진을 다시 골라도 반응하게
    if (!f) return
    if (!/^image\//.test(f.type || '')) { toast('사진 파일만 올릴 수 있어요'); return }
    if (f.size > 8 * 1024 * 1024) { toast('사진이 너무 커요 · 8MB 이하로 올려주세요'); return }
    /* 원본을 그대로 넣지 않는다. 폰 사진 한 장(3~5MB)이면 기기 저장소 한도(약 5MB)를
       혼자 넘겨, 그 뒤로 가게·메뉴를 고친 내용이 하나도 저장되지 않았다.
       긴 변 480px JPEG 로 줄이면 보통 30~80KB 다. */
    const r = new FileReader()
    r.onerror = () => toast('사진을 읽지 못했어요 · 다른 사진으로 해 보세요')
    r.onload = () => {
      const src = typeof r.result === 'string' ? r.result : null
      if (!src) return
      const im = new Image()
      im.onerror = () => toast('사진을 읽지 못했어요 · 다른 사진으로 해 보세요')
      im.onload = () => {
        const MAX = 480
        const k = Math.min(1, MAX / Math.max(im.width, im.height))
        const w = Math.max(1, Math.round(im.width * k)), h = Math.max(1, Math.round(im.height * k))
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        const g = c.getContext('2d')
        if (!g) { toast('이 브라우저에선 사진을 줄일 수 없어요'); return }
        g.drawImage(im, 0, 0, w, h)
        const out = c.toDataURL('image/jpeg', 0.75)
        if (out.length > 300 * 1024) { toast('사진이 너무 커요 · 다른 사진으로 해 보세요'); return }
        setImg(out)
      }
      im.src = src
    }
    r.readAsDataURL(f)
  }

  // 검사 통과 시 저장할 내용, 아니면 null
  const validPatch = () => {
    setTried(true)
    if (nameErr || pErr) return null
    const patch = { nm: name.slice(0, NAME_MAX), price: newPrice, img }
    if (priceChanged) { patch.margin = estMargin; patch.profit = est.profit }
    return patch
  }

  const save = (e) => {
    e.preventDefault()
    const patch = validPatch()
    if (!patch) return
    updateMenu(menu.id, patch)
    toast(priceChanged
      ? `<b>${esc(patch.nm)}</b> ${won(newPrice)}원으로 바꿨어요 · 예상 마진 ${estMargin}%`
      : `<b>${esc(patch.nm)}</b> 저장했어요`)
    onClose()
  }

  // 저장하고 결과 화면에서 정확히 다시 계산 — 옛 가격으로 원가를 복원한 뒤 새 가격을 얹는다
  const recalc = () => {
    const patch = validPatch()
    if (!patch) return
    updateMenu(menu.id, patch)
    loadMenu({ ...menu, nm: patch.nm, img: patch.img })
    if (priceChanged) setPrice(newPrice)
    onClose()
    nav('/app/result')
  }

  const duplicate = () => {
    duplicateMenu(menu.id)
    toast(`<b>${esc(menu.nm)}</b> 복제했어요 · 메뉴판에 '(복사)'로 생겼어요`)
    onClose()
  }

  const remove = () => {
    if (!window.confirm(`'${menu.nm}' 메뉴를 메뉴판에서 지울까요?\n지우면 되돌릴 수 없어요.`)) return
    deleteMenu(menu.id)
    toast(`<b>${esc(menu.nm)}</b> 삭제했어요`)
    onClose()
  }

  return (
    <Mn2Sheet title="메뉴 고치기" onClose={onClose}>
      <form onSubmit={save} noValidate>
        <div className="mn2-photo-row">
          <div className="mn2-photo"><Photo src={img} icon={menu.icon || 'bowl'} iconSize={34} alt={menu.nm} /></div>
          <div className="mn2-photo-act">
            <button type="button" className="mn2-btn" onClick={() => fileRef.current && fileRef.current.click()}>
              <Icon name="camera" size={17} stroke={1.9} />사진 {img ? '바꾸기' : '넣기'}
            </button>
            {img && <button type="button" className="mn2-btn ghost" onClick={() => setImg(null)}>사진 빼기</button>}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
          </div>
        </div>

        <div className="mn2-field">
          <label className="mn2-lab" htmlFor="mn2-edit-name"><span>메뉴 이름</span><em>{name.length}/{NAME_MAX}</em></label>
          <div className={`mn2-input${tried && nameErr ? ' bad' : ''}`}>
            <input id="mn2-edit-name" value={nm} maxLength={NAME_MAX} placeholder="예: 제육덮밥" autoComplete="off"
              aria-invalid={tried && !!nameErr} onChange={(e) => setNm(e.target.value)} />
          </div>
          {tried && nameErr && <p className="mn2-err" role="alert">{nameErr}</p>}
        </div>

        <div className="mn2-field">
          <label className="mn2-lab" htmlFor="mn2-edit-price"><span>판매가</span>{oldPrice > 0 && <em>지금 {won(oldPrice)}원</em>}</label>
          <div className={`mn2-input${pErr && (tried || price.length >= 3) ? ' bad' : ''}`}>
            <input id="mn2-edit-price" className="num" inputMode="numeric" pattern="[0-9]*" autoComplete="off"
              value={commas(price)} placeholder="0" aria-invalid={!!pErr}
              onChange={(e) => setPriceD(onlyDigits(e.target.value))} />
            <span className="mn2-unit">원</span>
          </div>
          {pErr && (tried || price.length >= 3) && <p className="mn2-err" role="alert">{pErr}</p>}
        </div>

        {priceChanged && (
          <div className="mn2-shift" role="status">
            <div className="mn2-shift-row">
              마진 <span className={`was ${sOld}`}>{oldMargin}%</span>
              <Icon name="chevR" size={14} stroke={2.6} />
              <b className={sNew}>약 {estMargin}%</b>
            </div>
            판매가를 바꾸면 마진이 달라져요. 지금 원가를 그대로 두고 어림한 값이라,
            재료값이 바뀌었다면 정확한 마진은 결과 화면에서 다시 계산하세요.
            {estMargin < safePct && <> <b>안전선 {safePct}%보다 낮아요.</b></>}
            <div>
              <button type="button" className="mn2-link" onClick={recalc}>
                결과 화면에서 다시 계산<Icon name="chevR" size={15} stroke={2.4} />
              </button>
            </div>
          </div>
        )}

        <button type="submit" className="mn2-go">저장</button>

        <div className="mn2-actions">
          <button type="button" className="mn2-act" onClick={duplicate}>
            <Icon name="copy" size={17} stroke={1.9} />복제
          </button>
          <button type="button" className="mn2-act danger" onClick={remove}>
            <Icon name="trash" size={17} stroke={1.9} />삭제
          </button>
        </div>
      </form>
    </Mn2Sheet>
  )
}
