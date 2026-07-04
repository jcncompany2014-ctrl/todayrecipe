/* 식자재 카탈로그 + 카테고리 토큰.
   기존 14종은 실사진(img), 확장분은 카테고리 톤 + 라인 아이콘으로 폴백(프로토타입). */

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
// img=실사진 경로(있으면 사용). 없으면 icon으로 폴백.
export const PRODUCTS = {
  // ── 정육 ──
  samgyup: { nm: '삼겹살',   cat: 'meat',  icon: 'meat',    price: 12000, unit: '/kg',   perG: 12,  trend: ['dn', 3], popular: true,  cookable: true,  method: '볶기', defG: 120, origin: '국내산', spec: '냉장 · 1kg 팩', img: '/img/samgyup.webp' },
  moksal:  { nm: '목살',     cat: 'meat',  icon: 'meat',    price: 11500, unit: '/kg',   perG: 11.5,trend: ['up', 4], popular: false, cookable: true,  method: '볶기', defG: 130, origin: '국내산', spec: '냉장 · 1kg 팩', img: '/img/moksal.webp' },
  apdari:  { nm: '앞다리살', cat: 'meat',  icon: 'meat',    price: 9000,  unit: '/kg',   perG: 9,   trend: ['dn', 1], popular: false, cookable: true,  method: '볶기', defG: 150, origin: '국내산', spec: '냉장 · 1kg 팩', img: '/img/apdari.webp' },
  beef:    { nm: '소고기(불고기)', cat: 'meat', icon: 'meat', price: 15000, unit: '/kg', perG: 15,  trend: ['up', 4], popular: false, cookable: true,  method: '볶기', defG: 120, origin: '호주산', spec: '냉장 · 불고기용' },
  chadol:  { nm: '차돌박이', cat: 'meat',  icon: 'meat',    price: 22000, unit: '/kg',   perG: 22,  trend: ['up', 3], popular: false, cookable: true,  method: '볶기', defG: 80,  origin: '미국산', spec: '냉동 · 슬라이스' },
  galbi:   { nm: '돼지갈비', cat: 'meat',  icon: 'meat',    price: 13000, unit: '/kg',   perG: 13,  trend: ['up', 2], popular: false, cookable: true,  method: '볶기', defG: 200, origin: '국내산', spec: '냉장 · 양념용' },
  dakdari: { nm: '닭다리살', cat: 'meat',  icon: 'chicken', price: 7500,  unit: '/kg',   perG: 7.5, trend: ['dn', 6], popular: false, cookable: true,  method: '볶기', defG: 130, origin: '국내산', spec: '냉장 · 정육 1kg', img: '/img/dakdari.webp' },
  dakgasal:{ nm: '닭가슴살', cat: 'meat',  icon: 'chicken', price: 8000,  unit: '/kg',   perG: 8,   trend: ['dn', 2], popular: false, cookable: true,  method: '삶기', defG: 120, origin: '국내산', spec: '냉장 · 정육 1kg' },
  bacon:   { nm: '베이컨',   cat: 'meat',  icon: 'meat',    price: 14000, unit: '/kg',   perG: 14,  trend: ['fl', 0], popular: false, cookable: true,  method: '볶기', defG: 40,  origin: '수입산', spec: '냉장 · 슬라이스' },
  luncheon:{ nm: '런천햄',   cat: 'meat',  icon: 'meat',    price: 12000, unit: '/kg',   perG: 12,  trend: ['fl', 0], popular: false, cookable: true,  method: '볶기', defG: 60,  origin: '국내산', spec: '캔 · 340g' },

  // ── 수산 ──
  godeungeo:{ nm: '고등어',  cat: 'sea',   icon: 'fish',    price: 9000,  unit: '/손',   perG: 9,   trend: ['dn', 3], popular: false, cookable: true,  method: '볶기', defG: 120, origin: '노르웨이산', spec: '냉동 · 손질' },
  dongtae: { nm: '동태',     cat: 'sea',   icon: 'fish',    price: 7000,  unit: '/kg',   perG: 7,   trend: ['fl', 0], popular: false, cookable: true,  method: '삶기', defG: 150, origin: '러시아산', spec: '냉동 · 손질' },
  jogae:   { nm: '바지락',   cat: 'sea',   icon: 'clam',    price: 8000,  unit: '/kg',   perG: 8,   trend: ['dn', 4], popular: false, cookable: true,  method: '삶기', defG: 100, origin: '국내산', spec: '해감 · 1kg' },
  honghap: { nm: '홍합',     cat: 'sea',   icon: 'clam',    price: 5000,  unit: '/kg',   perG: 5,   trend: ['dn', 2], popular: false, cookable: true,  method: '삶기', defG: 120, origin: '국내산', spec: '자숙 · 1kg' },
  shrimp:  { nm: '흰다리새우',cat: 'sea',   icon: 'shrimp',  price: 18000, unit: '/kg',   perG: 18,  trend: ['up', 3], popular: false, cookable: true,  method: '볶기', defG: 60,  origin: '베트남산', spec: '냉동 · 껍질제거', img: '/img/shrimp.webp' },
  squid:   { nm: '오징어',   cat: 'sea',   icon: 'squid',   price: 9000,  unit: '/kg',   perG: 9,   trend: ['dn', 4], popular: false, cookable: true,  method: '볶기', defG: 70,  origin: '원양산', spec: '냉동 · 손질', img: '/img/squid.webp' },
  nakji:   { nm: '낙지',     cat: 'sea',   icon: 'squid',   price: 20000, unit: '/kg',   perG: 20,  trend: ['up', 5], popular: false, cookable: true,  method: '볶기', defG: 80,  origin: '국내산', spec: '냉장 · 손질' },
  myeolchi:{ nm: '멸치',     cat: 'sea',   icon: 'fish',    price: 25000, unit: '/kg',   perG: 25,  trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 15,  origin: '국내산', spec: '건멸치 · 육수용' },

  // ── 청과 ──
  onion:   { nm: '양파',     cat: 'veg',   icon: 'onion',   price: 2000,  unit: '/kg',   perG: 2,   trend: ['dn', 8], popular: true,  cookable: true,  method: '생',   defG: 60,  origin: '국내산', spec: '망 · 1.5kg', img: '/img/onion.webp' },
  daepa:   { nm: '대파',     cat: 'veg',   icon: 'scallion',price: 3500,  unit: '/단',   perG: 12,  trend: ['dn', 2], popular: true,  cookable: true,  method: '생',   defG: 15,  origin: '국내산', spec: '흙대파 · 1단', img: '/img/daepa.webp' },
  garlic:  { nm: '다진마늘', cat: 'veg',   icon: 'garlic',  price: 8000,  unit: '/kg',   perG: 8,   trend: ['fl', 0], popular: false, cookable: true,  method: '생',   defG: 10,  origin: '국내산', spec: '간 마늘 · 팩', img: '/img/garlic.webp' },
  potato:  { nm: '감자',     cat: 'veg',   icon: 'potato',  price: 2500,  unit: '/kg',   perG: 2.5, trend: ['dn', 3], popular: false, cookable: true,  method: '볶기', defG: 100, origin: '국내산', spec: '수미 · 1kg' },
  carrot:  { nm: '당근',     cat: 'veg',   icon: 'carrot',  price: 2000,  unit: '/kg',   perG: 2,   trend: ['fl', 0], popular: false, cookable: true,  method: '볶기', defG: 40,  origin: '국내산', spec: '세척 · 1kg' },
  mu:      { nm: '무',       cat: 'veg',   icon: 'radish',  price: 1500,  unit: '/개',   perG: 2,   trend: ['fl', 0], popular: false, cookable: true,  method: '삶기', defG: 100, origin: '국내산', spec: '1개 · 약 800g' },
  baechu:  { nm: '배추',     cat: 'veg',   icon: 'cabbage', price: 3000,  unit: '/포기', perG: 1.5, trend: ['dn', 6], popular: false, cookable: true,  method: '생',   defG: 150, origin: '국내산', spec: '1포기 · 약 2kg' },
  yangbaechu:{ nm: '양배추', cat: 'veg',   icon: 'cabbage', price: 3500,  unit: '/통',   perG: 2.2, trend: ['dn', 2], popular: false, cookable: true,  method: '볶기', defG: 80,  origin: '국내산', spec: '1통' },
  kongnamul:{ nm: '콩나물',  cat: 'veg',   icon: 'sprout',  price: 3000,  unit: '/kg',   perG: 3,   trend: ['dn', 2], popular: true,  cookable: true,  method: '삶기', defG: 80,  origin: '국내산', spec: '국산콩 · 1kg' },
  neutari: { nm: '느타리버섯',cat: 'veg',   icon: 'mushroom',price: 6000,  unit: '/kg',   perG: 6,   trend: ['fl', 0], popular: false, cookable: true,  method: '볶기', defG: 60,  origin: '국내산', spec: '1kg' },
  cheongyang:{ nm: '청양고추',cat: 'veg',  icon: 'pepper',  price: 12000, unit: '/kg',   perG: 12,  trend: ['up', 3], popular: false, cookable: true,  method: '생',   defG: 10,  origin: '국내산', spec: '1kg' },
  buchu:   { nm: '부추',     cat: 'veg',   icon: 'scallion',price: 8000,  unit: '/kg',   perG: 8,   trend: ['fl', 0], popular: false, cookable: true,  method: '생',   defG: 30,  origin: '국내산', spec: '1단' },

  // ── 양념 ──
  gochu:   { nm: '고추장',   cat: 'sauce', icon: 'jar',     price: 9000,  unit: '/1kg',  perG: 9,   trend: ['fl', 0], popular: true,  cookable: false, method: '생',   defG: 30,  origin: '국내산', spec: '태양초 · 1kg', img: '/img/gochu.webp' },
  doenjang:{ nm: '된장',     cat: 'sauce', icon: 'jar',     price: 7000,  unit: '/1kg',  perG: 7,   trend: ['fl', 0], popular: true,  cookable: false, method: '생',   defG: 30,  origin: '국내산', spec: '재래식 · 1kg' },
  gochugaru:{ nm: '고춧가루', cat: 'sauce', icon: 'sack',    price: 25000, unit: '/1kg',  perG: 25,  trend: ['up', 4], popular: false, cookable: false, method: '생',   defG: 15,  origin: '국내산', spec: '태양초 · 1kg' },
  ganjang: { nm: '간장',     cat: 'sauce', icon: 'bottle',  price: 5000,  unit: '/900ml',perG: 5,   trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 15,  origin: '국내산', spec: '양조 · 900ml', img: '/img/ganjang.webp' },
  gulsauce:{ nm: '굴소스',   cat: 'sauce', icon: 'bottle',  price: 8000,  unit: '/500g', perG: 16,  trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 20,  origin: '수입산', spec: '500g' },
  chamgireum:{ nm: '참기름', cat: 'sauce', icon: 'bottle',  price: 15000, unit: '/500ml',perG: 30,  trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 8,   origin: '국내산', spec: '100% · 500ml' },
  matsul:  { nm: '맛술',     cat: 'sauce', icon: 'bottle',  price: 4000,  unit: '/900ml',perG: 4.4, trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 20,  origin: '국내산', spec: '900ml' },
  sikcho:  { nm: '식초',     cat: 'sauce', icon: 'bottle',  price: 3000,  unit: '/900ml',perG: 3.3, trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 15,  origin: '국내산', spec: '양조 · 900ml' },
  sugar:   { nm: '설탕',     cat: 'sauce', icon: 'sack',    price: 2000,  unit: '/kg',   perG: 2,   trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 15,  origin: '수입 원료', spec: '백설탕 · 1kg' },
  salt:    { nm: '소금',     cat: 'sauce', icon: 'sack',    price: 2000,  unit: '/kg',   perG: 2,   trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 8,   origin: '국내산', spec: '천일염 · 1kg' },

  // ── 기타 ──
  egg:     { nm: '계란',     cat: 'etc',   icon: 'egg',     price: 6000,  unit: '/30구', perG: 4,   trend: ['up', 5], popular: true,  cookable: true,  method: '삶기', defG: 50,  origin: '국내산', spec: '특란 · 30구', img: '/img/egg.webp' },
  rice:    { nm: '쌀(밥)',   cat: 'etc',   icon: 'rice',    price: 3000,  unit: '/kg',   perG: 3,   trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 100, origin: '국내산', spec: '백미 · 1kg', img: '/img/rice.webp' },
  dubu:    { nm: '두부',     cat: 'etc',   icon: 'tofu',    price: 2000,  unit: '/모',   perG: 6,   trend: ['fl', 0], popular: true,  cookable: true,  method: '삶기', defG: 120, origin: '국내산', spec: '찌개용 · 300g' },
  kimchi:  { nm: '배추김치', cat: 'etc',   icon: 'cabbage', price: 6000,  unit: '/kg',   perG: 6,   trend: ['fl', 0], popular: true,  cookable: false, method: '생',   defG: 100, origin: '국내산', spec: '포기김치 · 1kg' },
  dangmyeon:{ nm: '당면',    cat: 'etc',   icon: 'noodle',  price: 5000,  unit: '/kg',   perG: 5,   trend: ['fl', 0], popular: false, cookable: true,  method: '삶기', defG: 60,  origin: '국내산', spec: '1kg' },
  ramyeon: { nm: '라면사리', cat: 'etc',   icon: 'noodle',  price: 700,   unit: '/개',   perG: 7,   trend: ['fl', 0], popular: false, cookable: true,  method: '삶기', defG: 100, origin: '국내산', spec: '5개입' },
  flour:   { nm: '밀가루',   cat: 'etc',   icon: 'sack',    price: 1500,  unit: '/kg',   perG: 1.5, trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 50,  origin: '수입 원료', spec: '중력분 · 1kg' },
  oil:     { nm: '식용유',   cat: 'etc',   icon: 'oil',     price: 6000,  unit: '/1.8L', perG: 3,   trend: ['up', 2], popular: false, cookable: false, method: '생',   defG: 10,  origin: '수입 원료', spec: '콩기름 · 1.8L', img: '/img/oil.webp' },
  milk:    { nm: '우유',     cat: 'etc',   icon: 'milk',    price: 2800,  unit: '/1L',   perG: 2.8, trend: ['fl', 0], popular: false, cookable: false, method: '생',   defG: 100, origin: '국내산', spec: '1L' },
  cheese:  { nm: '슬라이스치즈',cat: 'etc', icon: 'cheese',  price: 10000, unit: '/kg',   perG: 10,  trend: ['up', 2], popular: false, cookable: false, method: '생',   defG: 30,  origin: '수입산', spec: '슬라이스 · 1kg' },
}

// 인기 (가로 스크롤 "사장님이 많이 담아요")
export const POPULAR = ['samgyup', 'onion', 'egg', 'dubu', 'kongnamul', 'gochu', 'potato', 'daepa']

// 세로 리스트 섹션 (카테고리 순서)
export const SECTIONS = [
  { cat: 'meat',  ids: ['samgyup', 'moksal', 'apdari', 'beef', 'chadol', 'galbi', 'dakdari', 'dakgasal', 'bacon', 'luncheon'] },
  { cat: 'sea',   ids: ['godeungeo', 'dongtae', 'jogae', 'honghap', 'shrimp', 'squid', 'nakji', 'myeolchi'] },
  { cat: 'veg',   ids: ['onion', 'daepa', 'garlic', 'potato', 'carrot', 'mu', 'baechu', 'yangbaechu', 'kongnamul', 'neutari', 'cheongyang', 'buchu'] },
  { cat: 'sauce', ids: ['gochu', 'doenjang', 'gochugaru', 'ganjang', 'gulsauce', 'chamgireum', 'matsul', 'sikcho', 'sugar', 'salt'] },
  { cat: 'etc',   ids: ['egg', 'rice', 'dubu', 'kimchi', 'dangmyeon', 'ramyeon', 'flour', 'oil', 'milk', 'cheese'] },
]
