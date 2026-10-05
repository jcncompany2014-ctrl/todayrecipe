import { useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'
import Orb from './Orb'
import { useStore } from '../state/store'

/* 데스크톱 사이드바 — 폰 모형을 걷어낸 자리에 들어가는 진짜 웹앱 내비게이션.
   모바일에서는 CSS로 숨기고 하단 탭바를 쓴다. */
const NAV = [
  { to: '/app/menu',      ic: 'list',     t: '메뉴판' },
  { to: '/app/dashboard', ic: 'bars',     t: '대시보드' },
  { to: '/app/sales',     ic: 'receipt',  t: '오늘 장사 마감' },
  { to: '/app/monthly',   ic: 'doc',      t: '이번 달 손익' },
  { to: '/app/matrix',    ic: 'quad',     t: '메뉴 분석' },
  { to: '/app/combo',     ic: 'layers',   t: '세트·콤보' },
]
const NAV_FOOT = [
  { to: '/app/vision',    ic: 'sparkle',  t: '앞으로의 기능' },
  { to: '/app/settings',  ic: 'sliders',  t: '설정' },
]

export default function Sidebar() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { currentStore, stores, newBuild, menus, storageOK } = useStore()

  const go = (to) => nav(to)
  const startNew = () => { newBuild(); nav('/app/market') }
  const item = (n) => (
    <button key={n.to} className={`sb-item${pathname === n.to ? ' on' : ''}`} onClick={() => go(n.to)}>
      <Icon name={n.ic} size={18} stroke={1.9} />
      <span>{n.t}</span>
    </button>
  )

  return (
    <aside className="sidebar" aria-label="주 메뉴">
      <div className="sb-brand">
        <span className="sb-orb"><Orb mood="idle" size={20} tone="green" label="앱 동작 중" /></span>
        <b>오늘 몇 그릇?</b>
      </div>

      <button className="sb-store" onClick={() => go('/app')}>
        <span className="sb-store-ic"><Icon name="store" size={16} stroke={1.9} /></span>
        <span className="sb-store-tx">
          <b>{currentStore ? currentStore.nm : '가게 선택'}</b>
          <em>{stores.length > 1 ? `사업장 ${stores.length}곳 · 바꾸기` : `메뉴 ${menus.length}개`}</em>
        </span>
        <Icon name="chevR" size={15} stroke={2} />
      </button>

      <button className="sb-new" onClick={startNew}>
        <Icon name="plus" size={18} stroke={2.3} />
        <span>새 메뉴 원가 계산</span>
      </button>

      <nav className="sb-nav">{NAV.map(item)}</nav>
      <div className="sb-spacer" />
      <nav className="sb-nav sb-nav-foot">{NAV_FOOT.map(item)}</nav>

      <p className="sb-save">
        <i className={storageOK ? 'ok' : 'warn'} />
        {storageOK ? '이 기기에 자동 저장 중' : '저장이 막혀 있어요 · 설정에서 백업하세요'}
      </p>
    </aside>
  )
}
