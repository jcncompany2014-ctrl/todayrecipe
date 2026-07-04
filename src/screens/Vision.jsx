import Icon from '../components/Icon'
import { WholesalePreview, PosPreview, AlertPreview } from '../components/VisionPreviews'

const VISIONS = [
  {
    ic: 'link', h: '실시간 도매가 비교', Prev: WholesalePreview,
    p: '여러 도매처의 오늘 단가를 한 화면에서 비교하고, 최저가로 바로 담아 발주까지. 가격 차이가 그릇당 원가에 얼마인지도 바로 보여드려요.',
  },
  {
    ic: 'receipt', h: 'POS·배달앱 매출 연동', Prev: PosPreview,
    p: '홀·포장·배달앱 주문을 자동으로 합산해, 오늘 실제로 몇 그릇 팔렸는지·본전까지 얼마 남았는지 실시간으로.',
  },
  {
    ic: 'bell', h: '시세 변동 알림', Prev: AlertPreview,
    p: '재료 시세가 튀면 어느 메뉴 마진이 얼마나 깎이는지 콕 집어 알려드려요. 마진 방어선이 무너지기 전에.',
  },
]

export default function Vision() {
  return (
    <div className="scroll">
      <div className="hd fade">
        <h1 className="hd-title">비전</h1>
        <p className="hd-desc">지금은 직접, 곧 자동으로</p>
      </div>
      <p className="vintro fade">
        지금 앱은 <b>입력한 재료 + 참고 시세</b>로 진짜 원가를 계산하고, 오늘 마감·한 달 손익까지 다 해줘요.
        다음 단계에선 <b>실시간 도매가</b>와 <b>실제 매출</b>을 이어 붙여, 손품 팔던 일까지 데이터로 대신하게 만들 거예요.
      </p>
      {VISIONS.map((v, i) => {
        const Prev = v.Prev
        return (
          <div key={i} className="vcard fade" style={{ animationDelay: `${0.05 + i * 0.05}s` }}>
            <span className="soon">출시 예정</span>
            <div className="ic"><Icon name={v.ic} size={24} stroke={1.7} /></div>
            <h2>{v.h}</h2>
            <p>{v.p}</p>
            <Prev />
          </div>
        )
      })}
    </div>
  )
}
