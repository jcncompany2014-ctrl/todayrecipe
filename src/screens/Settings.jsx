import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useStore } from '../state/store'

const ROWS = [
  { ic: 'store', b: '가게 정보', s: '상호·업종·영업 형태' },
  { ic: 'money', b: '부대비용 기본값', s: '배달수수료·포장·인건비·가스' },
  { ic: 'bars', b: '시세 기준', s: '참고 시세 출처 · 업데이트 주기' },
  { ic: 'bell', b: '알림', s: '시세 변동 · 마진 경고' },
  { ic: 'doc', b: '데이터·라이선스', s: '공공데이터·이미지 출처 표기' },
]

export default function Settings() {
  const nav = useNavigate()
  const { toast } = useStore()
  return (
    <div className="scroll">
      <div className="hd fade">
        <h1 className="hd-title">설정</h1>
        <p className="hd-desc">앱과 가게 기준을 맞춰요</p>
      </div>
      <div className="group fade">
        {ROWS.map((r) => (
          <div key={r.b} className="srow" onClick={() => toast(`'${r.b}'은 다음 단계에서 열려요`)}>
            <span className="ic"><Icon name={r.ic} size={19} stroke={1.7} /></span>
            <div className="tx"><b>{r.b}</b><span>{r.s}</span></div>
            <Icon name="chevR" size={18} stroke={2} className="chev" />
          </div>
        ))}
      </div>
      <div className="group fade" style={{ animationDelay: '.05s' }}>
        <div className="srow" onClick={() => nav('/')}>
          <span className="ic"><Icon name="back" size={19} stroke={1.7} /></span>
          <div className="tx"><b>소개 페이지로</b><span>랜딩으로 돌아가기</span></div>
          <Icon name="chevR" size={18} stroke={2} className="chev" />
        </div>
      </div>
      <p className="ver">오늘 몇 그릇? · v1.0 데모</p>
    </div>
  )
}
