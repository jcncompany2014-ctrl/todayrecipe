import { useState } from 'react'
import Icon from './Icon'

/* 범용 사진 썸네일 — src(실사) 우선, 없거나 실패 시 라인 아이콘으로 폴백.
   부모가 배경/크기 박스를 제공. object-fit:cover 로 채움. */
export default function Photo({ src, icon, iconSize = 26, iconColor, alt = '' }) {
  const [err, setErr] = useState(false)
  if (src && !err) {
    return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  }
  return <Icon name={icon} size={iconSize} stroke={1.7} style={iconColor ? { color: iconColor } : undefined} />
}
