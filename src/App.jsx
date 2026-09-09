import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import Landing from './screens/Landing'

/* 앱 화면은 필요할 때 받는다.
   전에는 랜딩만 보러 온 사람도 13개 화면을 전부 내려받았다.
   Landing만 즉시 로드 — 첫 화면이라 지연이 곧 이탈이다. */
const Stores = lazy(() => import('./screens/Stores'))
const Menu = lazy(() => import('./screens/Menu'))
const Market = lazy(() => import('./screens/Market'))
const Cart = lazy(() => import('./screens/Cart'))
const Result = lazy(() => import('./screens/Result'))
const Dashboard = lazy(() => import('./screens/Dashboard'))
const SalesToday = lazy(() => import('./screens/SalesToday'))
const Combo = lazy(() => import('./screens/Combo'))
const Monthly = lazy(() => import('./screens/Monthly'))
const MenuMatrix = lazy(() => import('./screens/MenuMatrix'))
const Vision = lazy(() => import('./screens/Vision'))
const Settings = lazy(() => import('./screens/Settings'))


/* 화면이 도착하기 전 잠깐 — 흰 화면 대신 자리를 지킨다.
   깜빡임처럼 보이지 않게 최소한의 표시만 한다. */
function ScreenFallback() {
  return (
    <div className="screen-loading" role="status" aria-live="polite">
      <span className="sl-dot" /><span className="sl-dot" /><span className="sl-dot" />
      <span className="sr-only">불러오는 중</span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Stores />} />
          <Route path="menu" element={<Menu />} />
          <Route path="market" element={<Market />} />
          <Route path="cart" element={<Cart />} />
          <Route path="result" element={<Result />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sales" element={<SalesToday />} />
          <Route path="combo" element={<Combo />} />
          <Route path="monthly" element={<Monthly />} />
          <Route path="matrix" element={<MenuMatrix />} />
          <Route path="vision" element={<Vision />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
