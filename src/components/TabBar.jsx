import { useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { useStore } from '../state/store'

export default function TabBar() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { newBuild } = useStore()
  const on = (p) => (pathname === p ? 'tab on' : 'tab')

  const startNew = () => { newBuild(); nav('/app/market') }

  return (
    <nav className="tabbar">
      <button className={on('/app/menu')} onClick={() => nav('/app/menu')}>
        <Icon name="list" size={23} stroke={1.8} />
        <span>메뉴판</span>
      </button>
      <button className={on('/app/dashboard')} onClick={() => nav('/app/dashboard')}>
        <Icon name="bars" size={23} stroke={1.9} />
        <span>대시보드</span>
      </button>
      <div className="fab-slot">
        <button className="fab" onClick={startNew} aria-label="새 메뉴 만들기">
          <Icon name="plus" size={25} stroke={2.3} />
        </button>
      </div>
      <button className={on('/app/vision')} onClick={() => nav('/app/vision')}>
        <Icon name="sparkle" size={23} stroke={1.8} />
        <span>비전</span>
      </button>
      <button className={on('/app/settings')} onClick={() => nav('/app/settings')}>
        <Icon name="sliders" size={23} stroke={1.8} />
        <span>설정</span>
      </button>
    </nav>
  )
}
