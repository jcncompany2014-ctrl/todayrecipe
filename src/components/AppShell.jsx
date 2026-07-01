import { Outlet, useLocation } from 'react-router-dom'
import StatusBar from './StatusBar'
import TabBar from './TabBar'
import { useStore } from '../state/store'

// 라우트 → 화면 스코프 클래스 + 하단 탭 노출 여부
const ROUTE = {
  '/app':           { cls: 'scr-menu',                  tab: true },
  '/app/market':    { cls: 'scr-market',                tab: false },
  '/app/cart':      { cls: 'scr-cart',                  tab: false },
  '/app/result':    { cls: 'scr-result',               tab: false },
  '/app/dashboard': { cls: 'scr-dash scr-tabpage',      tab: true },
  '/app/vision':    { cls: 'scr-vision scr-tabpage',    tab: true },
  '/app/settings':  { cls: 'scr-settings scr-tabpage',  tab: true },
}

export default function AppShell() {
  const { pathname } = useLocation()
  const { toastMsg } = useStore()
  const r = ROUTE[pathname] || ROUTE['/app']

  return (
    <div className="stage">
      <div className="device">
        <div className={`screen ${r.cls}`}>
          <StatusBar />
          <Outlet />
          {r.tab && <TabBar />}
          <div className={`toast${toastMsg ? ' show' : ''}`}
            dangerouslySetInnerHTML={{ __html: toastMsg || '' }} />
        </div>
      </div>
    </div>
  )
}
