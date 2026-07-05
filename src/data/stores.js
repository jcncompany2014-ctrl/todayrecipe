/* 사업장(가게) 시드 — 한 사장님이 여러 매장을 한 앱에서 관리.
   매장마다 자기 메뉴판을 따로 갖는다(메뉴 id는 매장별로 고유). 첫 매장이 기본 가게. */
import { SEED_MENUS } from './menus'

export const SEED_STORES = [
  {
    id: 'st_main', nm: '행복분식', type: '분식·한식', loc: '서울 마포', primary: true,
    menus: SEED_MENUS, // 기존 9메뉴(기본 가게) — clone은 store에서
  },
  {
    id: 'st_2', nm: '행복분식 2호점', type: '분식·한식', loc: '서울 서대문',
    menus: [
      { id: 's2_kimbap',   nm: '김밥',       price: 3500, margin: 48, pop: 44, icon: 'donbap' },
      { id: 's2_jeyuk',    nm: '제육덮밥',   price: 8500, margin: 38, pop: 34, icon: 'donbap', img: '/img/dish_jeyuk.webp' },
      { id: 's2_ramen',    nm: '라면',       price: 4000, margin: 55, pop: 30, icon: 'bowl' },
      { id: 's2_donkkaseu',nm: '돈까스',     price: 9000, margin: 33, pop: 22, icon: 'plate', img: '/img/dish_donkkaseu.webp' },
      { id: 's2_udon',     nm: '우동',       price: 6500, margin: 30, pop: 18, icon: 'bowl', img: '/img/dish_udon.webp' },
    ],
  },
  {
    id: 'st_3', nm: '초원 한식당', type: '백반·찌개', loc: '경기 성남',
    menus: [
      { id: 's3_sundubu',  nm: '순두부찌개', price: 8500, margin: 41, pop: 30, icon: 'pot', img: '/img/dish_sundubu.webp' },
      { id: 's3_kimchi',   nm: '김치찌개',   price: 8000, margin: 39, pop: 26, icon: 'pot', img: '/img/dish_kimchi.webp' },
      { id: 's3_bibim',    nm: '비빔밥',     price: 9000, margin: 36, pop: 20, icon: 'bowl' },
      { id: 's3_bulgogi',  nm: '불고기백반', price: 11000, margin: 28, pop: 15, icon: 'plate' },
    ],
  },
]
