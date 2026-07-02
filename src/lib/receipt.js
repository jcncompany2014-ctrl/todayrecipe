/* 원가 명세서 → 이미지(PNG). 순수 프론트(캔버스), 외부 서비스/라이브러리 없음.
   페이지에 로드된 Pretendard로 직접 그려 저장·공유·인쇄. */

const C = {
  pine: '#0C2B1E', pine2: '#123A29', mint: '#41D392', mintSoft: '#A9E8C9',
  ink: '#17130F', soft: '#55504B', muted: '#A39B92', cream: '#FBFAF8',
  line: '#E7E2DA', good: '#16A06A', warn: '#D69412', bad: '#D04B3F',
}
const CAT_C = { meat: '#BC857B', sea: '#7F98A7', veg: '#85A06E', sauce: '#B89767', etc: '#AF9F85' }
const sigColor = (m) => (m >= 30 ? C.good : m >= 20 ? C.warn : C.bad)
const won = (n) => Math.round(n).toLocaleString('ko-KR')
const FF = "'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"

export async function buildReceiptCanvas(d) {
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready } catch { /* ignore */ }

  const S = 2, W = 680, PAD = 46
  const rowH = 36, secH = 46, headerH = 176, footerH = 84
  const ings = d.ings || [], ovh = d.ovh || []
  const totalsH = 24 + 66 + 50 * 3 + 8
  const H = headerH + (secH + ings.length * rowH + 22) + (secH + ovh.length * rowH + 22) + totalsH + footerH

  const cv = document.createElement('canvas')
  cv.width = W * S; cv.height = Math.round(H) * S
  const x = cv.getContext('2d'); x.scale(S, S)
  const RW = W - PAD * 2

  // 배경
  x.fillStyle = C.cream; x.fillRect(0, 0, W, H)

  // 헤더 (딥 그린 밴드)
  const g = x.createLinearGradient(0, 0, W, headerH)
  g.addColorStop(0, C.pine2); g.addColorStop(1, C.pine)
  x.fillStyle = g; x.fillRect(0, 0, W, headerH)
  x.textBaseline = 'alphabetic'
  x.fillStyle = C.mintSoft; x.font = `700 20px ${FF}`
  x.fillText('오늘 몇 그릇?', PAD, 54)
  x.fillStyle = '#FCFCF8'; x.font = `800 44px ${FF}`
  x.fillText(d.nm || '메뉴', PAD, 108)
  x.fillStyle = 'rgba(255,255,255,.62)'; x.font = `500 19px ${FF}`
  x.fillText('1그릇 원가 명세서 · 조리 수율 반영', PAD, 142)

  let y = headerH + 40

  const sectionTitle = (t, sub) => {
    x.fillStyle = C.ink; x.font = `800 21px ${FF}`; x.textAlign = 'left'
    x.fillText(t, PAD, y)
    if (sub) { x.fillStyle = C.muted; x.font = `600 14px ${FF}`; x.textAlign = 'right'; x.fillText(sub, W - PAD, y) }
    x.textAlign = 'left'
    y += 30
  }
  const row = (label, val, opt = {}) => {
    const cy = y + rowH / 2
    if (opt.dot) { x.fillStyle = opt.dot; x.beginPath(); x.arc(PAD + 6, cy - 1, 5, 0, Math.PI * 2); x.fill() }
    x.fillStyle = opt.strong ? C.ink : C.soft
    x.font = `${opt.strong ? 700 : 500} 17px ${FF}`; x.textAlign = 'left'; x.textBaseline = 'middle'
    x.fillText(label, PAD + (opt.dot ? 22 : 0), cy)
    x.fillStyle = opt.color || C.ink; x.font = `${opt.strong ? 800 : 700} 17px ${FF}`; x.textAlign = 'right'
    x.fillText(val, W - PAD, cy)
    x.textAlign = 'left'; x.textBaseline = 'alphabetic'
    y += rowH
  }
  const rule = (dashed = true, col = C.line) => {
    x.strokeStyle = col; x.lineWidth = 1.4
    x.setLineDash(dashed ? [4, 4] : [])
    x.beginPath(); x.moveTo(PAD, y); x.lineTo(W - PAD, y); x.stroke(); x.setLineDash([])
    y += 16
  }

  // 재료
  sectionTitle('재료 (조리 후 실원가)', `합계 ${won(d.ingTotal)}원`)
  ings.forEach((it) => row(it.label, `${won(it.v)}원`, { dot: CAT_C[it.cat] || C.muted }))
  y += 6; rule()

  // 부대비용
  sectionTitle('부대비용', `합계 ${won(d.ovhTotal)}원`)
  ovh.forEach((it) => row(it.label, `${won(it.v)}원`))
  y += 6; rule(false, C.ink)

  // 합계 블록
  const cy0 = y + 20
  x.fillStyle = C.soft; x.font = `600 17px ${FF}`; x.textAlign = 'left'; x.textBaseline = 'middle'
  x.fillText('1그릇 실원가', PAD, cy0)
  x.fillStyle = C.ink; x.font = `800 40px ${FF}`; x.textAlign = 'right'
  x.fillText(`${won(d.cost)}원`, W - PAD, cy0 + 4)
  x.textAlign = 'left'; x.textBaseline = 'alphabetic'
  y += 66

  row('판매가', `${won(d.price)}원`, { strong: true })
  row('마진', `${d.margin}%`, { strong: true, color: sigColor(d.margin) })
  row('하루 본전', d.bowls === Infinity ? '—' : `${d.bowls}그릇`, { strong: true })

  // 푸터
  y = H - footerH + 30
  x.strokeStyle = C.line; x.lineWidth = 1.4; x.setLineDash([])
  x.beginPath(); x.moveTo(PAD, y - 18); x.lineTo(W - PAD, y - 18); x.stroke()
  x.fillStyle = C.muted; x.font = `500 14px ${FF}`; x.textAlign = 'left'
  x.fillText(`${d.date || ''} · 하루 고정비 ${won(d.dailyFixed)}원 기준`, PAD, y + 6)
  x.fillStyle = C.pine2; x.font = `700 14px ${FF}`; x.textAlign = 'right'
  x.fillText('todayrecipe.vercel.app', W - PAD, y + 6)
  x.textAlign = 'left'

  return cv
}

function printDataUrl(dataUrl) {
  const ifr = document.createElement('iframe')
  ifr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(ifr)
  const doc = ifr.contentWindow.document
  doc.open()
  doc.write(`<!doctype html><html><head><style>@page{margin:12mm}body{margin:0}img{width:100%}</style></head><body><img src="${dataUrl}"></body></html>`)
  doc.close()
  const done = () => setTimeout(() => ifr.remove(), 1500)
  setTimeout(() => { try { ifr.contentWindow.focus(); ifr.contentWindow.print() } catch { /* ignore */ } done() }, 350)
}

// mode: 'save' | 'share' | 'print'
export async function exportReceipt(data, mode = 'save') {
  const cv = await buildReceiptCanvas(data)
  const fname = `오늘몇그릇_${(data.nm || '메뉴').replace(/\s+/g, '')}_원가명세서.png`

  if (mode === 'print') { printDataUrl(cv.toDataURL('image/png')); return 'print' }

  const blob = await new Promise((res) => cv.toBlob(res, 'image/png'))
  if (!blob) throw new Error('이미지 생성 실패')

  if (mode === 'share' && navigator.canShare) {
    try {
      const file = new File([blob], fname, { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${data.nm} 원가 명세서`, text: '오늘 몇 그릇? 원가 명세서' })
        return 'shared'
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return 'canceled'
      /* 공유 미지원 → 저장으로 폴백 */
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = fname
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return 'saved'
}
