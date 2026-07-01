/* 식자재 카탈로그 + 카테고리 토큰 (레퍼런스 시드 그대로, 진열대 채우기용으로 확장) */

// 카테고리별 사진 톤 (저채도 = 사진처럼 + 클리셰 회피, 색 코딩 역할)
export const CATS = {
  meat:  { label: '정육', g: 'linear-gradient(140deg,#F7E8E4,#EFD8D2)', c: '#BC857B' },
  sea:   { label: '수산', g: 'linear-gradient(140deg,#E5ECF0,#D6E1E7)', c: '#7F98A7' },
  veg:   { label: '청과', g: 'linear-gradient(140deg,#E9F0E3,#DAE7D1)', c: '#85A06E' },
  sauce: { label: '양념', g: 'linear-gradient(140deg,#F5EDDE,#ECE0C9)', c: '#B89767' },
  etc:   { label: '기타', g: 'linear-gradient(140deg,#F5F0E7,#ECE4D6)', c: '#AF9F85' },
}

// 식자재 마스터.
// perG=원/g · defG=담을 때 기본 사용량 · cookable=조리로 수율 변하는지 · method=기본 조리법
// img=실사진 경로(있으면 placeholder 대신 사용, 라이선스 안전 소스만)
export const PRODUCTS = {
  samgyup: { nm: '삼겹살',   cat: 'meat',  icon: 'meat',     price: 12000, unit: '/kg',   perG: 12,  trend: ['dn', 3], popular: true,  cookable: true,  method: '볶기', defG: 120, img: '/img/samgyup.webp' },
  apdari:  { nm: '앞다리살', cat: 'meat',  icon: 'meat',     price: 9000,  unit: '/kg',   perG: 9,   trend: ['dn', 1], popular: false, cookable: true,  method: '볶기', defG: 150, img: '/img/apdari.webp' },
  moksal:  { nm: '목살',     cat: 'meat',  icon: 'meat',     price: 11500, unit: '/kg',   perG: 11.5,trend: ['up', 4], popular: false, cookable: true,  method: '볶기', defG: 130, img: '/img/moksal.webp' },
  dakdari: { nm: '닭다리살', cat: 'meat',  icon: 'chicken',  price: 7500,  unit: '/kg',   perG: 7.5, trend: ['dn', 6], popular: false, cookable: true,  method: '볶기', defG: 130, img: '/img/dakdari.webp' },
  shrimp:  { nm: '흰다리새우',cat: 'sea',   icon: 'shrimp',   price: 18000, unit: '/kg',   perG: 18,  trend: ['up', 3], popular: false, cookable: true,  method: '볶기', defG: 60,  img: '/img/shrimp.webp' },
  squid:   { nm: '오징어',   cat: 'sea',   icon: 'squid',    price: 9000,  unit: '/kg',   perG: 9,   trend: ['dn', 4], popular: false, cookable: true,  method: '볶기', defG: 70,  img: '/img/squid.webp' },
  onion:   { nm: '양파',     cat: 'veg',   icon: 'onion',    price: 2000,  unit: '/kg',   perG: 2,   trend: ['dn', 8], popular: true,  cookable: true,  method: '생',   defG: 60,  img: '/img/onion.webp' },
  daepa:   { nm: '대파',     cat: 'veg',   icon: 'scallion', price: 3500,  unit: '/단',   perG: 12,  trend: ['dn', 2], popular: true,  cookable: true,  method: '생',   defG: 15,  img: '/img/daepa.webp' },
  garlic:  { nm: '다진마늘', cat: 'veg',   icon: 'garlic',   price: 8000,  unit: '/kg',   perG: 8,   trend: ['fl', 0], popular: false, cookable: true,  method: '생',   defG: 10,  img: '/img/garlic.webp' },
  egg:     { nm: '계란',     cat: 'etc',   icon: 'egg',      price: 6000,  unit: '/30구', perG: 4,   trend: ['up', 5], popular: true,  cookable: true,  method: '삶기', defG: 50,  img: '/img/egg.webp' },
  rice:    { nm: '쌀(밥)',   cat: 'etc',   icon: 'rice',     price: 3000,  unit: '/kg',   perG: 3,   trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 100, img: '/img/rice.webp' },
  oil:     { nm: '식용유',   cat: 'etc',   icon: 'oil',      price: 6000,  unit: '/1.8L', perG: 3,   trend: ['up', 2], popular: false, cookable: false, method: '생',   defG: 10,  img: '/img/oil.webp' },
  gochu:   { nm: '고추장',   cat: 'sauce', icon: 'jar',      price: 9000,  unit: '/1kg',  perG: 9,   trend: ['fl', 0], popular: true,  cookable: false, method: '생',   defG: 30,  img: '/img/gochu.webp' },
  ganjang: { nm: '간장',     cat: 'sauce', icon: 'bottle',   price: 5000,  unit: '/900ml',perG: 5,   trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 15,  img: '/img/ganjang.webp' },
}

// 인기 (가로 스크롤 "사장님이 많이 담아요")
export const POPULAR = ['samgyup', 'onion', 'egg', 'daepa', 'gochu']

// 세로 리스트 섹션 (카테고리 순서)
export const SECTIONS = [
  { cat: 'meat',  ids: ['samgyup', 'apdari', 'moksal', 'dakdari'] },
  { cat: 'sea',   ids: ['shrimp', 'squid'] },
  { cat: 'veg',   ids: ['onion', 'daepa', 'garlic'] },
  { cat: 'sauce', ids: ['gochu', 'ganjang'] },
  { cat: 'etc',   ids: ['egg', 'rice', 'oil'] },
]
