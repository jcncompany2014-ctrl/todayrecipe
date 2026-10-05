import '../styles/onboarding.css'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store'
import { won } from '../lib/calc'
import Icon from './Icon'
import Orb from './Orb'

/* 첫 실행 — 내 가게 시작 설정.
   예전엔 '앱 소개 슬라이드 4장'이었다. 사장님은 소개를 읽으러 온 게 아니라
   내 가게 메뉴 원가를 알고 싶어 왔다. 그래서 바로 내 가게를 만든다.

   ① 환영 → ② 가게 설정(이름만 필수) → ③ 준비 끝 → 첫 메뉴 원가 계산.

   ※ 가게를 실제로 만드는 건 ③의 버튼을 누를 때다.
     startMyStore 가 onboarded 를 true 로 바꾸는 순간 셸이 이 화면을 내려버려서,
     ②에서 만들면 ③을 보여줄 수 없다. ③은 '확인' 화면이고 거기서 확정한다. */

const TYPES = ['분식', '한식', '중식', '일식', '양식', '카페', '주점', '기타']
const SHARES = [
  { v: 0, t: '배달 안 함', s: '0%' },
  { v: 0.3, t: '조금', s: '30%' },
  { v: 0.5, t: '반반', s: '50%' },
  { v: 0.8, t: '대부분', s: '80%' },
  { v: 1, t: '배달 전문', s: '100%' },
]
const DEFAULT_SHARE = 0.5
const MAX_MANWON = 10000 // 1억 원 — 스토어 상한과 같다
const NAME_MAX = 24

const digits = (s) => String(s || '').replace(/[^\d]/g, '')
const clampDays = (n) => Math.min(31, Math.max(1, Math.round(n) || 1))

function Dots({ step }) {
  return (
    <div className="ob2-dots" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}
      aria-label={`3단계 중 ${step}단계`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={`ob2-dot${n === step ? ' on' : ''}${n < step ? ' done' : ''}`} />
      ))}
    </div>
  )
}

function Why({ children }) {
  return (
    <p className="ob2-why">
      <Icon name="info" size={14} stroke={2} />
      <span>{children}</span>
    </p>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const {
    isSample, stores, userStores, startMyStore, exploreSample, setOnboarded, newBuild,
    monthlyFixed, workDays,
  } = useStore()

  const [step, setStep] = useState(1)
  const [nm, setNm] = useState('')
  const [type, setType] = useState('')
  const [fixedMan, setFixedMan] = useState('')          // 만원 단위 문자열 — 비우면 기존 값 유지
  const [days, setDays] = useState(() => clampDays(workDays > 0 && workDays <= 31 ? workDays : 26))
  const [share, setShare] = useState(null)               // null = 안 고름 → 반반
  const [tried, setTried] = useState(false)              // 시작하기를 한 번 눌렀나(오류 표시용)
  const nameRef = useRef(null)
  const bodyRef = useRef(null)

  // 단계가 바뀌면 맨 위부터 보이게
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [step])

  const name = nm.trim()
  const nameErr = tried && !name ? '가게 이름을 넣어주세요.' : ''

  const manNum = fixedMan === '' ? null : Number(fixedMan)
  const fixedErr = manNum != null && manNum > MAX_MANWON ? '1억 원(10000만원)까지 넣을 수 있어요.' : ''
  const fixedWon = manNum != null && manNum > 0 && !fixedErr ? manNum * 10000 : null
  const baseFixed = monthlyFixed > 0 ? monthlyFixed : 0
  const effFixed = fixedWon ?? baseFixed
  const effShare = share ?? DEFAULT_SHARE
  const dailyFixed = days > 0 ? Math.round(effFixed / days) : 0

  // 이미 내 가게를 쓰고 있다가 다시 들어온 경우 — 덮어쓰기 전에 묻고, 닫을 수도 있게
  const mine = Array.isArray(userStores) ? userStores : []
  const hasOwn = mine.length > 0

  const submitSetup = (e) => {
    if (e) e.preventDefault()
    setTried(true)
    if (!name) {
      if (nameRef.current) nameRef.current.focus()
      return
    }
    if (fixedErr) return
    setStep(3)
  }

  const commit = () => {
    if (!name) { setStep(2); return false }
    /* 확인을 묻지 않는다 — 이제 아무것도 지우지 않기 때문이다.
       스토어의 startMyStore 는 예시 가게만 치우고, 사장님이 만든 가게(mine)는
       그대로 둔 채 새 가게를 추가한다. 예전 문구("가게와 메뉴가 지워집니다")는
       실제 동작과 달라 사장님을 겁주기만 했다. */
    startMyStore({
      nm: name.slice(0, NAME_MAX),
      type,
      monthlyFixed: fixedWon ?? undefined,
      workDays: days,
      deliveryShare: effShare,
    })
    return true
  }

  const goFirstMenu = () => {
    if (!commit()) return
    newBuild()
    navigate('/app/market')
  }
  const goHome = () => {
    if (!commit()) return
    navigate('/app')
  }

  return (
    <div className={`onb ob2-root ob2-s${step}`} role="dialog" aria-modal="true" aria-label="내 가게 시작하기">
      {/* ── ① 환영 ───────────────────────────────────────── */}
      {step === 1 && (
        <section className="ob2-panel ob2-dark ob2-fade" key="s1">
          <header className="ob2-top">
            <Dots step={1} />
            {hasOwn && (
              <button type="button" className="ob2-close" onClick={() => setOnboarded(true)} aria-label="닫고 내 가게로 돌아가기">
                <Icon name="x" size={20} stroke={2.2} />
              </button>
            )}
          </header>
          <div className="ob2-hero">
            <Orb mood="building" size={64} tone="mint" label="가게를 준비하고 있어요" />
            <p className="ob2-brand">오늘 몇 그릇?</p>
            <h1 className="ob2-h1">
              <span>메뉴 한 그릇,</span>
              <span>진짜 얼마 남는지</span>
              <span>바로 알려드려요</span>
            </h1>
            <p className="ob2-lead">재료를 담으면 1인분 원가·마진, 그리고 하루 몇 그릇 팔아야 본전인지 계산해요.</p>
          </div>
          <div className="ob2-actions">
            <button type="button" className="ob2-btn ob2-btn-mint" onClick={() => setStep(2)}>
              <Icon name="store" size={20} stroke={2.2} />
              <span>내 가게로 시작하기</span>
            </button>
            {hasOwn ? (
              <button type="button" className="ob2-btn ob2-btn-ghost" onClick={() => setOnboarded(true)}>
                지금 쓰던 가게로 돌아가기
              </button>
            ) : (
              <button type="button" className="ob2-btn ob2-btn-ghost" onClick={exploreSample}>
                예시 가게로 먼저 둘러보기
              </button>
            )}
            <p className="ob2-fine">가입 없이 이 기기에만 저장돼요. 1분이면 끝나요.</p>
          </div>
        </section>
      )}

      {/* ── ② 가게 설정 ───────────────────────────────────── */}
      {step === 2 && (
        <form className="ob2-panel ob2-light ob2-fade" key="s2" onSubmit={submitSetup} noValidate>
          <header className="ob2-top ob2-top-light">
            <button type="button" className="ob2-back" onClick={() => setStep(1)} aria-label="이전 화면">
              <Icon name="back" size={22} stroke={2.2} />
            </button>
            <Dots step={2} />
            <span className="ob2-top-sp" aria-hidden="true" />
          </header>

          <div className="ob2-body" ref={bodyRef}>
            <div className="ob2-wrap">
              <h2 className="ob2-h2">우리 가게를 알려주세요</h2>
              <p className="ob2-sub">가게 이름만 넣으면 시작할 수 있어요. 나머지는 몰라도 괜찮아요 — 나중에 설정에서 고칠 수 있어요.</p>

              {/* 가게 이름 */}
              <div className="ob2-field">
                <label className="ob2-lab" htmlFor="ob2-nm">가게 이름 <em className="ob2-req">필수</em></label>
                <input
                  id="ob2-nm" ref={nameRef} className={`ob2-input${nameErr ? ' is-err' : ''}`}
                  type="text" value={nm} maxLength={NAME_MAX} autoComplete="organization" enterKeyHint="next"
                  placeholder="예) 행복분식" aria-invalid={!!nameErr} aria-describedby="ob2-nm-why"
                  onChange={(e) => setNm(e.target.value)}
                />
                {nameErr
                  ? <p className="ob2-err" role="alert">{nameErr}</p>
                  : <Why><span id="ob2-nm-why">가게가 여러 곳이어도 이름으로 나눠서 관리해요.</span></Why>}
              </div>

              {/* 업종 */}
              <fieldset className="ob2-field">
                <legend className="ob2-lab">업종 <em className="ob2-opt">선택</em></legend>
                <div className="ob2-chips">
                  {TYPES.map((t) => (
                    <button type="button" key={t} aria-pressed={type === t}
                      className={`ob2-chip${type === t ? ' on' : ''}`}
                      onClick={() => setType((p) => (p === t ? '' : t))}>
                      {type === t && <Icon name="check" size={14} stroke={2.8} />}{t}
                    </button>
                  ))}
                </div>
                <Why>가게 목록에서 알아보기 쉽게 이름 옆에 붙여드려요.</Why>
              </fieldset>

              {/* 고정비 */}
              <div className="ob2-field">
                <label className="ob2-lab" htmlFor="ob2-fixed">한 달 고정비 <em className="ob2-opt">몰라도 돼요</em></label>
                <p className="ob2-hint">월세 + 인건비 + 공과금을 합친 금액</p>
                <div className={`ob2-unit${fixedErr ? ' is-err' : ''}`}>
                  <input
                    id="ob2-fixed" className="ob2-input ob2-num" type="text" inputMode="numeric" pattern="[0-9]*"
                    value={fixedMan} maxLength={6} enterKeyHint="done" aria-invalid={!!fixedErr}
                    placeholder={baseFixed > 0 ? String(Math.round(baseFixed / 10000)) : '예) 630'}
                    onChange={(e) => setFixedMan(digits(e.target.value).replace(/^0+(?=\d)/, ''))}
                  />
                  <span className="ob2-suffix">만원</span>
                </div>
                {fixedErr ? (
                  <p className="ob2-err" role="alert">{fixedErr}</p>
                ) : (
                  <p className="ob2-calc num">
                    {fixedWon != null
                      ? <>한 달 <b>{won(fixedWon)}원</b></>
                      : <>비워두면 <b>{won(baseFixed)}원</b>(보통 가게 기준)으로 계산해요</>}
                  </p>
                )}
                <Why>고정비를 알아야 하루 몇 그릇 팔아야 본전인지 계산해요.</Why>
              </div>

              {/* 영업일 */}
              <div className="ob2-field">
                <span className="ob2-lab" id="ob2-days-lab">한 달 영업일</span>
                <div className="ob2-step" role="group" aria-labelledby="ob2-days-lab">
                  <button type="button" className="ob2-stepbtn" aria-label="하루 줄이기"
                    disabled={days <= 1} onClick={() => setDays((d) => clampDays(d - 1))}>
                    <Icon name="minus" size={20} stroke={2.4} />
                  </button>
                  <output className="ob2-stepval num" aria-live="polite"><b>{days}</b>일</output>
                  <button type="button" className="ob2-stepbtn" aria-label="하루 늘리기"
                    disabled={days >= 31} onClick={() => setDays((d) => clampDays(d + 1))}>
                    <Icon name="plus" size={20} stroke={2.4} />
                  </button>
                </div>
                <Why>고정비를 영업일로 나눠 하루에 버텨야 할 돈을 구해요. 주 6일이면 26일쯤이에요.</Why>
              </div>

              {/* 배달 비중 */}
              <fieldset className="ob2-field">
                <legend className="ob2-lab">배달 비중 <em className="ob2-opt">대충이면 돼요</em></legend>
                <div className="ob2-chips ob2-chips-share">
                  {SHARES.map((o) => (
                    <button type="button" key={o.v} aria-pressed={share === o.v}
                      className={`ob2-chip ob2-chip-2${share === o.v ? ' on' : ''}`}
                      onClick={() => setShare((p) => (p === o.v ? null : o.v))}>
                      <span className="ob2-chip-t">{o.t}</span>
                      <span className="ob2-chip-s num">{o.s}</span>
                    </button>
                  ))}
                </div>
                {share == null && <p className="ob2-calc">안 고르면 <b>반반(50%)</b>으로 계산해요</p>}
                <Why>배달앱 수수료·포장비는 배달로 나가는 그릇에만 붙어요. 그만큼 원가에 넣어요.</Why>
              </fieldset>
            </div>
          </div>

          <footer className="ob2-foot">
            <div className="ob2-wrap">
              <button type="submit" className="ob2-btn ob2-btn-pine">
                <span>시작하기</span>
                <Icon name="chevR" size={20} stroke={2.4} />
              </button>
            </div>
          </footer>
        </form>
      )}

      {/* ── ③ 준비 끝 ─────────────────────────────────────── */}
      {step === 3 && (
        <section className="ob2-panel ob2-dark ob2-fade" key="s3">
          <header className="ob2-top">
            <button type="button" className="ob2-back ob2-back-dark" onClick={() => setStep(2)} aria-label="설정 고치기">
              <Icon name="back" size={22} stroke={2.2} />
            </button>
            <Dots step={3} />
            <span className="ob2-top-sp" aria-hidden="true" />
          </header>
          <div className="ob2-hero ob2-hero-done">
            <Orb mood="calculating" size={64} tone="mint" label="계산 준비 완료" />
            <h1 className="ob2-h1 ob2-h1-done">
              <span className="ob2-store">{name || '우리 가게'}</span>
              <span>준비 끝</span>
            </h1>
            <dl className="ob2-sum">
              {type && (
                <div><dt>업종</dt><dd>{type}</dd></div>
              )}
              <div><dt>한 달 고정비</dt><dd className="num">{won(effFixed)}원{fixedWon == null && <small> 기본값</small>}</dd></div>
              <div><dt>영업일</dt><dd className="num">{days}일</dd></div>
              <div><dt>배달 비중</dt><dd className="num">{Math.round(effShare * 100)}%</dd></div>
              <div className="ob2-sum-key"><dt>하루에 버텨야 할 고정비</dt><dd className="num">{won(dailyFixed)}원</dd></div>
            </dl>
            <p className="ob2-lead ob2-lead-done">이제 첫 메뉴의 재료를 담아보세요. 한 그릇에 얼마 남는지, 하루 몇 그릇 팔아야 본전인지 바로 나와요.</p>
          </div>
          <div className="ob2-actions">
            <button type="button" className="ob2-btn ob2-btn-mint" onClick={goFirstMenu}>
              <Icon name="bowl" size={20} stroke={2.2} />
              <span>첫 메뉴 원가 계산하기</span>
            </button>
            <button type="button" className="ob2-btn ob2-btn-ghost" onClick={goHome}>
              메뉴는 나중에, 가게 화면으로
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
