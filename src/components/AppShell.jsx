import { lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TabBar from './TabBar'
import Sidebar from './Sidebar'
/* 첫 실행 화면은 처음 한 번만 본다 — 한 번 설정한 사장님이 매번 내려받을 이유가 없다 */
const Onboarding = lazy(() => import('./Onboarding'))
import { useStore } from '../state/store'

// 라우트 → 화면 스코프 클래스 + 하단 탭 노출 여부(모바일)
const ROUTE = {
  '/app':           { cls: 'scr-stores',                tab: false },
  '/app/menu':      { cls: 'scr-menu',                  tab: true },
  '/app/market':    { cls: 'scr-market',                tab: false },
  '/app/cart':      { cls: 'scr-cart',                  tab: false },
  '/app/result':    { cls: 'scr-result',                tab: false },
  '/app/dashboard': { cls: 'scr-dash scr-tabpage',      tab: true },
  '/app/sales':     { cls: 'scr-sales',                 tab: false },
  '/app/combo':     { cls: 'scr-combo',                 tab: false },
  '/app/monthly':   { cls: 'scr-monthly',               tab: false },
  '/app/matrix':    { cls: 'scr-matrix',                tab: false },
  '/app/vision':    { cls: 'scr-vision scr-tabpage',    tab: true },
  '/app/settings':  { cls: 'scr-settings scr-tabpage',  tab: true },
}

/* 앱 셸.
   예전엔 모든 화면을 '아이폰 모형(.stage > .device)' 안에 넣고 가짜 상태바(9:41)를
   그렸다. 폰으로 열면 진짜 상태바 아래 가짜 상태바가 하나 더 떴고, PC에선 화면
   한가운데 폰 사진이 떠 있었다 — 쓰는 앱이 아니라 소개하는 화면이었다.
   이제 폰에서는 화면 전체를, PC에서는 사이드바 + 작업 영역을 쓴다. */
export default function AppShell() {
  const { pathname } = useLocation()
  const { toastMsg, onboarded } = useStore()
  const r = ROUTE[pathname] || ROUTE['/app']

  return (
    <div className="app">
      <Sidebar />
      <main className="app-main">
        <div className={`screen ${r.cls}${r.tab ? ' has-tab' : ''}`}>
          <Outlet />
          {r.tab && <TabBar />}
          <div className={`toast${toastMsg ? ' show' : ''}`} role="status" aria-live="polite"
            dangerouslySetInnerHTML={{ __html: toastMsg || '' }} />
        </div>
      </main>
      {!onboarded && <Suspense fallback={null}><Onboarding /></Suspense>}
    </div>
  )
}
