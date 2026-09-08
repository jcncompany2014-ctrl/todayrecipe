/* 에러 바운더리 — 화면 하나가 죽어도 앱 전체가 흰 화면이 되지 않게.
   사장님은 개발자가 아니다. '무슨 일이 났는지'와 '어떻게 빠져나가는지'만 보여준다. */
import { Component } from 'react'
import { clearAll } from '../state/persist'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err) {
    return { err }
  }

  componentDidCatch(err, info) {
    // 콘솔에는 원본을 남긴다(디버깅용). 사용자에게는 보여주지 않는다.
    console.error('[오늘몇그릇] 화면 오류', err, info)
  }

  render() {
    if (!this.state.err) return this.props.children
    return (
      <div className="errb">
        <div className="errb-card">
          <div className="errb-ic">!</div>
          <h1>화면을 여는 중 문제가 생겼어요</h1>
          <p>계산한 내용은 대부분 그대로 있어요.<br />아래 버튼으로 다시 열어보세요.</p>
          <button className="errb-go" onClick={() => window.location.reload()}>다시 열기</button>
          <button
            className="errb-reset"
            onClick={() => {
              if (window.confirm('저장된 메뉴·설정을 모두 지우고 처음 상태로 되돌릴까요?')) {
                clearAll()
                window.location.href = '/'
              }
            }}
          >
            그래도 안 되면 · 처음 상태로 되돌리기
          </button>
        </div>
      </div>
    )
  }
}
