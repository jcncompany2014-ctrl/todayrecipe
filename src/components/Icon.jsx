/* 인라인 SVG 아이콘 세트 — 이모지 금지. 레퍼런스 HTML의 path를 그대로 이식.
   24 viewBox, stroke 단색, round cap. (이모지 사용 시 싸구려 느낌 1순위) */

const P = {
  /* 식자재 */
  meat: '<path d="M5.5 9.5c0-2.2 2.9-4 6.5-4s6.5 1.8 6.5 4-1.3 6-6.5 6-6.5-3.8-6.5-6z"/><path d="M9.5 8.8c1 1 1 3.2 0 4.4M13 8.6c1 1 1 3.4 0 4.6"/>',
  chicken: '<circle cx="9.5" cy="9" r="4.3"/><path d="M12.4 12.1 17 16.7M14.8 16.3l1.9 1.9 1.2-1.2-1.9-1.9"/>',
  onion: '<path d="M12 7.5c-3.5 0-5.6 3-5.6 6.4S8.5 19 12 19s5.6-1.2 5.6-5.1S15.5 7.5 12 7.5z"/><path d="M9.6 8.8c-1 2.6-1 6.4 0 9.3M14.4 8.8c1 2.6 1 6.4 0 9.3M12 7.5V4.3"/>',
  scallion: '<path d="M9 3.5c-.5 5-.5 12.5 0 17M12 3.5c-.5 5-.5 12.5 0 17M15 3.5c-.5 5-.5 12.5 0 17"/><path d="M8 20.5h8"/>',
  garlic: '<path d="M12 4.4c-1.6 1.6-.9 3.6 0 3.6s1.6-2 0-3.6z"/><path d="M12 8c-3.1 0-5.2 2.6-5.2 5.6S8.9 19 12 19s5.2-2.4 5.2-5.4S15.1 8 12 8z"/><path d="M10 9.8c-.6 3-.6 5.8 0 8.4M14 9.8c.6 3 .6 5.8 0 8.4"/>',
  egg: '<ellipse cx="12" cy="13" rx="5.6" ry="7.2"/><ellipse cx="12" cy="14.5" rx="2.3" ry="2"/>',
  jar: '<path d="M7 9.2h10v8.6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M8 9.2V7.2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M10 6.2V4.6h4v1.6"/><path d="M9.5 13.5h5"/>',
  bottle: '<path d="M10.3 3.5h3.4v2l1 2.2v11.3a1.8 1.8 0 0 1-1.8 1.8h-1.8a1.8 1.8 0 0 1-1.8-1.8V7.7l1-2.2z"/><path d="M9.5 12h5"/>',
  rice: '<path d="M4 13h16"/><path d="M5 13a7 7 0 0 0 14 0"/><ellipse cx="9" cy="10.4" rx="1.05" ry="1.9"/><ellipse cx="12" cy="9.7" rx="1.05" ry="1.9"/><ellipse cx="15" cy="10.4" rx="1.05" ry="1.9"/>',
  shrimp: '<path d="M17 7c-4 0-8 2-9.5 5.5C6 16 8 18 11 18c4.5 0 6.5-3.5 6.5-7"/><path d="M17 7c1.5 0 2.5 1 2.5 2.2M7.6 12.4C6 12 4.6 12.2 4 13.4"/><circle cx="15.5" cy="9" r=".7" fill="currentColor" stroke="none"/>',
  squid: '<path d="M12 3.5c2.4 0 4 2 4 4.6v3.4c0 1-.6 1.6-1.2 2.2M12 3.5c-2.4 0-4 2-4 4.6v3.4c0 1 .6 1.6 1.2 2.2"/><path d="M9.2 13.8c-.5 2-1 4-2.2 5.7M12 14c0 2.2 0 4.3-.5 6.3M14.8 13.8c.5 2 1 4 2.2 5.7"/>',
  oil: '<path d="M9 4h4v2.3l2.6 2.4c.6.5.9 1.3.9 2.1v6.4a2 2 0 0 1-2 2H9.5a2 2 0 0 1-2-2v-6.4c0-.8.3-1.6.9-2.1L11 6.3"/><path d="M8 13h8"/>',

  /* 메뉴 */
  donbap: '<path d="M4 13h16"/><path d="M5 13a7 7 0 0 0 14 0"/><path d="M7.2 13a4.8 3.6 0 0 1 9.6 0"/><path d="M9.5 6.8c-.5.6-.5 1.2 0 1.8M14.5 6.4c-.5.6-.5 1.2 0 1.8"/>',
  pot: '<path d="M5 11.6h14v3.4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M3.4 11.6h17.2"/><path d="M5 11.6 3.4 9.6M19 11.6l1.6-2"/><path d="M9.4 6.4c-.5.6-.5 1.2 0 1.8M14.6 6.4c-.5.6-.5 1.2 0 1.8"/>',
  plate: '<ellipse cx="12" cy="14.2" rx="8.4" ry="3.1"/><path d="M8.4 13.6c0-1.7 1.6-2.8 3.6-2.8s3.6 1.1 3.6 2.8"/><path d="M9.9 12.4l.5.6M11.5 11.9l.5.6M13.1 12.1l.5.6"/>',
  malatang: '<path d="M4 13h16"/><path d="M5 13a7 7 0 0 0 14 0"/><path d="M9 6.2c-.6.7-.6 1.4 0 2.1M12 5.4c-.6.7-.6 1.4 0 2.1M15 6.2c-.6.7-.6 1.4 0 2.1"/>',
  naengmyeon: '<path d="M4 13h16"/><path d="M5 13a7 7 0 0 0 14 0"/><path d="M7.6 12c1-1.4 2.3-1.4 3.4 0s2.4 1.4 3.4 0"/>',
  bowl: '<path d="M4 12.5h16"/><path d="M5 12.5a7 7 0 0 0 14 0"/><path d="M9.5 6.6c-.5.6-.5 1.2 0 1.8M14.5 6.6c-.5.6-.5 1.2 0 1.8"/>',

  /* UI */
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  cart: '<path d="M3 4h2.2l2.1 11.2a1.5 1.5 0 0 0 1.5 1.2h8a1.5 1.5 0 0 0 1.5-1.2L20.5 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/>',
  list: '<rect x="4" y="4" width="16" height="16" rx="3.2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  bars: '<path d="M6 20v-6"/><path d="M12 20V6"/><path d="M18 20v-9"/>',
  sparkle: '<path d="M12 4.5l1.7 4.3 4.3 1.7-4.3 1.7L12 16.5l-1.7-4.3L6 10.5l4.3-1.7z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  sliders: '<path d="M4 8h8M17 8h3"/><circle cx="14.5" cy="8" r="2.3"/><path d="M4 16h3M12 16h8"/><circle cx="9.5" cy="16" r="2.3"/>',

  /* 결과 / 비전 / 설정 */
  link: '<path d="M9.5 14.5l5-5"/><path d="M8 11l-2 2a3.2 3.2 0 0 0 4.5 4.5l2-2"/><path d="M16 13l2-2a3.2 3.2 0 0 0-4.5-4.5l-2 2"/>',
  receipt: '<path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3z"/><path d="M9 8h6M9 12h6"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11.2v4.6M12 8.1v.01"/>',
  store: '<path d="M4 9l1.6-4.5h12.8L20 9"/><path d="M5 9h14v9.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5z"/><path d="M9.5 20v-5h5v5"/>',
  money: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v.01M18 14.5v.01"/>',
  doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 13h5M10 16.5h5"/>',
  scale: '<path d="M12 4v15M7 19h10"/><path d="M5 8h14l-3 5a3 3 0 0 1-8 0z" /><path d="M12 4 5 8M12 4l7 4"/>',
}

export default function Icon({ name, size = 24, stroke = 1.7, fill = false, style, ...rest }) {
  const inner = P[name] || ''
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', ...style }}
      dangerouslySetInnerHTML={{ __html: inner }}
      {...rest}
    />
  )
}

/* 트렌드 삼각형 (12 viewBox, fill) */
export function TrendTri({ dir = 'dn', size = 9 }) {
  const path = dir === 'dn' ? 'M6 9 1.5 4h9z' : 'M6 3l4.5 5h-9z'
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor"
      dangerouslySetInnerHTML={{ __html: `<path d="${path}"/>` }} />
  )
}
