/* 시드: 내 메뉴판 + 기본 빌드(제육덮밥) 장바구니 */

// 등록 메뉴 (홈·대시보드용 — 저장된 계산 결과). margin은 신호등 색을 정함.
// img = 실사 요리 사진(AI 생성, 라이선스 안전). 없으면 icon으로 폴백.
export const SEED_MENUS = [
  { id: 'jeyuk',     nm: '제육덮밥', price: 9000,  margin: 41, icon: 'donbap',     img: '/img/dish_jeyuk.webp',     badge: '방금 계산' },
  { id: 'kimchi',    nm: '김치찌개', price: 8000,  margin: 41, icon: 'pot',        img: '/img/dish_kimchi.webp' },
  { id: 'donkkaseu', nm: '돈까스',   price: 9500,  margin: 35, icon: 'plate',      img: '/img/dish_donkkaseu.webp' },
  { id: 'sundubu',   nm: '순두부찌개', price: 8000, margin: 43, icon: 'pot',        img: '/img/dish_sundubu.webp' },
  { id: 'bokkeumbap',nm: '김치볶음밥', price: 7500, margin: 46, icon: 'donbap',     img: '/img/dish_bokkeumbap.webp' },
  { id: 'bibimbap',  nm: '비빔밥',   price: 8500,  margin: 38, icon: 'bowl' },
  { id: 'mala',      nm: '마라탕',   price: 9000,  margin: 24, icon: 'malatang',   img: '/img/dish_mala.webp' },
  { id: 'udon',      nm: '우동',     price: 7000,  margin: 28, icon: 'bowl',        img: '/img/dish_udon.webp' },
  { id: 'naengmyeon',nm: '물냉면',   price: 10000, margin: 12, icon: 'naengmyeon', img: '/img/dish_naengmyeon.webp' },
]

// 기본 빌드 — 마트→장바구니→결과 흐름의 기본 메뉴(제육덮밥). 사양 §6.4 그대로.
export const DEFAULT_BUILD = {
  id: 'jeyuk',
  nm: '제육덮밥',
  price: 9000,
  icon: 'donbap',
  img: '/img/dish_jeyuk.webp',
  items: [
    { id: 'apdari', grams: 150, method: '볶기' },
    { id: 'onion',  grams: 60,  method: '생' },
    { id: 'daepa',  grams: 15,  method: '생' },
    { id: 'gochu',  grams: 30,  method: '생' },
    { id: 'rice',   grams: 100, method: '생' },
  ],
}
