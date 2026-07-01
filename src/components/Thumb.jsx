import { useState } from 'react'
import Icon from './Icon'
import { CATS } from '../data/catalog'

/* 식자재 썸네일 — 실사진(img) 우선, 없거나 로드 실패 시 카테고리 톤 + 라인 아이콘으로 폴백.
   부모 박스(.himg/.vthumb/.tile)가 카테고리 그라데이션 배경을 제공. */
export default function Thumb({ product, iconSize = 34 }) {
  const [err, setErr] = useState(false)
  const c = CATS[product.cat]
  if (product.img && !err) {
    return <img src={product.img} alt={product.nm} loading="lazy" onError={() => setErr(true)} />
  }
  return <Icon name={product.icon} size={iconSize} stroke={1.6} style={{ color: c.c }} />
}
