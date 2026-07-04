import { useState, useRef } from 'react'
import Icon from './Icon'
import Photo from './Photo'
import { useStore } from '../state/store'

/* 메뉴 편집 바텀시트 — 이름 수정 + 사진 기입(기기에서 업로드, 인메모리). */
export default function MenuEditSheet({ menu, onClose }) {
  const { updateMenu, toast } = useStore()
  const [nm, setNm] = useState(menu.nm)
  const [img, setImg] = useState(menu.img || null)
  const fileRef = useRef(null)

  const pickPhoto = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    if (f.size > 8 * 1024 * 1024) { toast('사진이 너무 커요 · 8MB 이하로 올려주세요'); return }
    const r = new FileReader()
    r.onload = () => setImg(r.result)
    r.readAsDataURL(f)
  }

  const save = () => {
    const name = nm.trim() || menu.nm
    updateMenu(menu.id, { nm: name, img })
    toast(`<b>${name}</b> 저장했어요`)
    onClose()
  }

  return (
    <div className="msheet-wrap" onClick={onClose}>
      <div className="msheet" onClick={(e) => e.stopPropagation()}>
        <div className="ms-grab" />
        <div className="ms-head">
          <b>메뉴 편집</b>
          <button className="ms-x" aria-label="닫기" onClick={onClose}><Icon name="x" size={17} stroke={2.2} /></button>
        </div>

        <div className="ms-photo-row">
          <div className="ms-photo"><Photo src={img} icon={menu.icon || 'bowl'} iconSize={34} /></div>
          <div className="ms-photo-actions">
            <button className="ms-btn" onClick={() => fileRef.current && fileRef.current.click()}>
              <Icon name="camera" size={16} stroke={1.9} />사진 {img ? '바꾸기' : '추가하기'}
            </button>
            {img && <button className="ms-btn ghost" onClick={() => setImg(null)}>기본 아이콘으로</button>}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
          </div>
        </div>

        <label className="ms-field">
          <span>메뉴 이름</span>
          <input value={nm} onChange={(e) => setNm(e.target.value)} maxLength={20} placeholder="메뉴 이름을 입력하세요" />
        </label>

        <button className="ms-save" onClick={save}>저장</button>
      </div>
    </div>
  )
}
