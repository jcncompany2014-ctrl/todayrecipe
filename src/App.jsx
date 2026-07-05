import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import Landing from './screens/Landing'
import Stores from './screens/Stores'
import Menu from './screens/Menu'
import Market from './screens/Market'
import Cart from './screens/Cart'
import Result from './screens/Result'
import Dashboard from './screens/Dashboard'
import SalesToday from './screens/SalesToday'
import Combo from './screens/Combo'
import Monthly from './screens/Monthly'
import MenuMatrix from './screens/MenuMatrix'
import Vision from './screens/Vision'
import Settings from './screens/Settings'

export default function App() {
  return (
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
  )
}
