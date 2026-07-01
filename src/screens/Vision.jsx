import Icon from '../components/Icon'

const VISIONS = [
  { ic: 'link', h: '실시간 도매가 제휴 연동', p: '미트박스 같은 도매 플랫폼과 제휴해, 회원가입 없이도 오늘의 단가를 비교하고 바로 발주까지. (무단 크롤링이 아닌 정식 제휴 기반)' },
  { ic: 'receipt', h: 'POS·배달앱 매출 연동', p: '오늘 실제로 몇 그릇 팔렸는지 자동 추적. 예상 마진과 실제 매출을 나란히 보며 가격을 다듬어요.' },
  { ic: 'bell', h: '시세 변동 알림', p: '"삼겹살 12%↑, 제육덮밥 마진 재점검하세요" — 원가가 흔들리면 먼저 알려드려요.' },
]

export default function Vision() {
  return (
    <div className="scroll">
      <div className="hd fade">
        <h1 className="hd-title">비전</h1>
        <p className="hd-desc">곧 만나요 — 우리가 그리는 다음</p>
      </div>
      <p className="vintro fade">
        지금 앱은 <b>입력한 재료 + 참고 시세</b>로 진짜 원가를 계산해요. 다음 단계에선 <b>실시간 도매가</b>와
        <b> 실제 매출</b>까지 이어 붙여, 감이 아니라 데이터로 장사하게 만들 거예요.
      </p>
      {VISIONS.map((v, i) => (
        <div key={i} className="vcard fade" style={{ animationDelay: `${0.05 + i * 0.05}s` }}>
          <span className="soon">출시 예정</span>
          <div className="ic"><Icon name={v.ic} size={24} stroke={1.7} /></div>
          <h2>{v.h}</h2>
          <p>{v.p}</p>
        </div>
      ))}
    </div>
  )
}
