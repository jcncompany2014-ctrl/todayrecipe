/* 시드: 내 메뉴판 + 기본 빌드(제육덮밥) 장바구니 */

// 등록 메뉴 (홈·대시보드용 — 저장된 계산 결과). margin은 신호등 색을 정함.
export const SEED_MENUS = [
  { id: 'jeyuk',     nm: '제육덮밥', price: 9000,  margin: 41, icon: 'donbap',     badge: '방금 계산' },
  { id: 'kimchi',    nm: '김치찌개', price: 8000,  margin: 41, icon: 'pot' },
  { id: 'donkkaseu', nm: '돈까스',   price: 9500,  margin: 35, icon: 'plate' },
  { id: 'mala',      nm: '마라탕',   price: 9000,  margin: 24, icon: 'malatang' },
  { id: 'naengmyeon',nm: '물냉면',   price: 10000, margin: 12, icon: 'naengmyeon' },
]

// 기본 빌드 — 마트→장바구니→결과 흐름의 기본 메뉴(제육덮밥). 사양 §6.4 그대로.
// items: { id(=PRODUCTS 키), grams, method } — cookable/perG는 카탈로그에서 파생.
export const DEFAULT_BUILD = {
  id: 'jeyuk',
  nm: '제육덮밥',
  price: 9000,
  icon: 'donbap',
  items: [
    { id: 'apdari', grams: 150, method: '볶기' },
    { id: 'onion',  grams: 60,  method: '생' },
    { id: 'daepa',  grams: 15,  method: '생' },
    { id: 'gochu',  grams: 30,  method: '생' },
    { id: 'rice',   grams: 100, method: '생' },
  ],
}
