import '../styles/settings.css'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Orb from '../components/Orb'
import { useStore } from '../state/store'
import { won, overheadFor, YIELD_ATTRIBUTION } from '../lib/calc'

/* 설정 — 예전엔 행 다섯 개가 전부 "다음 단계에서 열려요" 토스트였다.
   이제 여기서 바꾼 값이 원가·마진·안전선 계산에 바로 들어간다.
   못 만드는 것(알림·시세 기준)은 화면에서 뺐다. */

const TYPES = ['분식', '한식', '백반·찌개', '중식', '일식', '양식', '치킨', '카페', '주점']

// 토스트는 HTML 문자열이다 — 사장님이 입력한 가게 이름은 반드시 이스케이프
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))
const roundTo = (n, d) => { const k = 10 ** d; return Math.round(n * k) / k }
const fmt = (n, d = 0) => (isFinite(n) ? Number(roundTo(n, d)).toLocaleString('ko-KR', { maximumFractionDigits: d }) : '0')
const today = () => {
  const d = new Date()
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/* 숫자 한 칸 — [−] 값 [+]. 값은 직접 눌러 고칠 수도 있다(입력 중엔 원문 그대로 두고, 나갈 때 반영). */
function NumField({ id, label, sub, value, unit, step, min, max, decimals = 0, onCommit }) {
  const [draft, setDraft] = useState(null)
  const safe = isFinite(value) ? value : 0
  const commit = (raw) => {
    setDraft(null)
    const n = parseFloat(String(raw).replace(/[,\s]/g, ''))
    if (!isFinite(n)) return
    const v = clamp(roundTo(n, decimals), min, max)
    if (v !== safe) onCommit(v)
  }
  const bump = (dir) => onCommit(clamp(roundTo(safe + dir * step, decimals), min, max))
  return (
    <div className="st2-field">
      <label className="st2-flab" htmlFor={id}>
        <b>{label}</b>
        {sub && <span>{sub}</span>}
      </label>
      <div className="st2-step">
        <button type="button" className="st2-sbtn" aria-label={`${label} ${fmt(step, decimals)}${unit} 줄이기`}
          disabled={safe <= min} onClick={() => bump(-1)}>
          <Icon name="minus" size={18} stroke={2.2} />
        </button>
        <span className="st2-sval">
          <input id={id} className="st2-sinput num" type="text"
            inputMode={decimals > 0 ? 'decimal' : 'numeric'} enterKeyHint="done" autoComplete="off"
            value={draft ?? fmt(safe, decimals)}
            onFocus={(e) => { setDraft(String(roundTo(safe, decimals))); requestAnimationFrame(() => e.target.select()) }}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') { setDraft(null); e.currentTarget.blur() } }} />
          <i>{unit}</i>
        </span>
        <button type="button" className="st2-sbtn" aria-label={`${label} ${fmt(step, decimals)}${unit} 늘리기`}
          disabled={safe >= max} onClick={() => bump(1)}>
          <Icon name="plus" size={18} stroke={2.2} />
        </button>
      </div>
    </div>
  )
}

function Section({ ic, title, desc, children, delay = 0, tone }) {
  return (
    <section className={`st2-sec fade${tone ? ' st2-' + tone : ''}`} style={{ animationDelay: `${delay}s` }}>
      <header className="st2-sec-hd">
        <span className="st2-sec-ic"><Icon name={ic} size={19} stroke={1.8} /></span>
        <div>
          <h2>{title}</h2>
          {desc && <p>{desc}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

/* ── 1. 가게 정보 ─────────────────────────────────────────────── */
function StoreInfo() {
  const { currentStore, currentStoreId, stores, updateStore, toast } = useStore()
  const cs = currentStore || {}
  const [nm, setNm] = useState(cs.nm || '')
  const [type, setType] = useState(cs.type || '')
  const [loc, setLoc] = useState(cs.loc || '')
  // 다른 가게로 바꾸면 그 가게 값으로 다시 채운다
  useEffect(() => { setNm(cs.nm || ''); setType(cs.type || ''); setLoc(cs.loc || '') }, [currentStoreId]) // eslint-disable-line react-hooks/exhaustive-deps

  const name = nm.trim()
  const dirty = name !== (cs.nm || '') || type.trim() !== (cs.type || '') || loc.trim() !== (cs.loc || '')
  const save = (e) => {
    e.preventDefault()
    if (!name || !currentStoreId) return
    updateStore(currentStoreId, { nm: name.slice(0, 24), type: type.trim().slice(0, 20), loc: loc.trim().slice(0, 24) })
    toast(`<b>${esc(name.slice(0, 24))}</b> 정보를 저장했어요`)
  }
  const reset = () => { setNm(cs.nm || ''); setType(cs.type || ''); setLoc(cs.loc || '') }

  return (
    <Section ic="store" title="가게 정보" delay={0.02}
      desc={(stores || []).length > 1 ? `가게 ${stores.length}곳 중 지금 보고 있는 가게예요` : '메뉴판·정산에 이 이름이 나와요'}>
      <form className="st2-form" onSubmit={save}>
        <label className="st2-tf">
          <span>상호</span>
          <input type="text" value={nm} maxLength={24} placeholder="예) 행복분식" autoComplete="organization"
            onChange={(e) => setNm(e.target.value)} aria-invalid={!name} />
          {!name && <em className="st2-err">가게 이름을 적어 주세요</em>}
        </label>
        <div className="st2-tf">
          <span id="st2-type-lab">업종</span>
          <div className="st2-chips" role="group" aria-labelledby="st2-type-lab">
            {TYPES.map((t) => (
              <button key={t} type="button" className={`st2-chip${type.trim() === t ? ' on' : ''}`}
                aria-pressed={type.trim() === t} onClick={() => setType(type.trim() === t ? '' : t)}>{t}</button>
            ))}
          </div>
          <input type="text" value={type} maxLength={20} placeholder="목록에 없으면 직접 적어요"
            aria-labelledby="st2-type-lab" onChange={(e) => setType(e.target.value)} />
        </div>
        <label className="st2-tf">
          <span>지역 <small>(선택)</small></span>
          <input type="text" value={loc} maxLength={24} placeholder="예) 서울 마포" onChange={(e) => setLoc(e.target.value)} />
        </label>
        {dirty && (
          <div className="st2-actions">
            <button type="button" className="st2-btn ghost" onClick={reset}>되돌리기</button>
            <button type="submit" className="st2-btn pri" disabled={!name}>
              <Icon name="check" size={17} stroke={2.4} />저장
            </button>
          </div>
        )}
      </form>
    </Section>
  )
}

/* ── 2. 고정비·목표 ───────────────────────────────────────────── */
function FixedCosts() {
  const { monthlyFixed, monthlyGoal, workDays, setMonthlyFixed, setMonthlyGoal, setWorkDays,
    dailyFixed, dailyGoal, safeMargin } = useStore()
  const sm = safeMargin || {}
  return (
    <Section ic="money" title="고정비·목표" delay={0.05}
      desc="한 달 기준으로 넣으면 하루치로 나눠 계산해요">
      <div className="st2-fields">
        <NumField id="st2-mf" label="한 달 고정비" sub="월세·인건비·공과금 합계 · 10만 원 단위"
          value={(monthlyFixed || 0) / 10000} unit="만 원" step={10} min={0} max={10000}
          onCommit={(v) => setMonthlyFixed(v * 10000)} />
        <NumField id="st2-mg" label="한 달 목표 순이익" sub="고정비 다 내고 남기고 싶은 돈"
          value={(monthlyGoal || 0) / 10000} unit="만 원" step={10} min={0} max={10000}
          onCommit={(v) => setMonthlyGoal(v * 10000)} />
        <NumField id="st2-wd" label="한 달 영업일" sub="쉬는 날 빼고"
          value={workDays || 1} unit="일" step={1} min={1} max={31}
          onCommit={(v) => setWorkDays(v)} />
      </div>
      <div className="st2-daily">
        <div><span>하루 고정비</span><b className="num">{won(dailyFixed || 0)}<i>원</i></b></div>
        <div><span>하루 목표</span><b className="num">{won(dailyGoal || 0)}<i>원</i></b></div>
      </div>
      <div className={`st2-safe${sm.reachable === false ? ' warn' : ''}`}>
        <div className="st2-safe-top">
          <span>우리 가게 안전선</span>
          <b className="num">{sm.pct ?? 30}<i>%</i></b>
        </div>
        <p>
          {sm.basis !== 'store'
            ? <>아직 판매 기록이나 메뉴가 부족해 기본값 30%로 봐요. 메뉴를 넣고 판매를 기록하면 이 가게 고정비로 다시 계산해 드려요.</>
            : sm.reachable === false
              ? <>지금 판매량으론 마진 {sm.rawNeed}%가 필요해서 현실적으로 어려워요. 마진 {sm.pct}%로 맞추려면 하루 <b>{sm.needBowls}그릇</b>(지금보다 {sm.shortBowls}그릇 더)이 필요해요.</>
              : <>하루 고정비{(dailyGoal || 0) > 0 ? '와 목표' : ''}를 하루 {sm.bowls}그릇 × 평균 {won(sm.avgPrice || 0)}원으로 나눈 값이에요. 메뉴 마진이 이 선 위면 초록불이에요.</>}
        </p>
      </div>
    </Section>
  )
}

/* ── 3. 부대비용 기본값 ───────────────────────────────────────── */
function Overheads() {
  const { costOpts, setRate, setDeliveryShare, setFlatFee, setPackaging, setLabor, setGas, currentStore, menus } = useStore()
  const c = costOpts || {}
  const list = menus || []
  const sample = list.length ? Math.round(list.reduce((a, m) => a + (m.price || 0), 0) / list.length / 100) * 100 : 9000
  const per = overheadFor(sample || 9000, c)
  const share = c.deliveryShare ?? 1
  return (
    <Section ic="sliders" title="부대비용 기본값" delay={0.08}
      desc="재료비 말고 한 그릇마다 빠져나가는 돈이에요">
      <p className="st2-scope"><Icon name="info" size={15} stroke={2} />
        <span><b>{currentStore?.nm || '이 가게'}</b>에만 적용돼요. 다른 가게는 따로 정해요.</span></p>
      <div className="st2-fields">
        <NumField id="st2-ds" label="배달 비중" sub={share === 0 ? '홀 전용 — 배달비가 안 붙어요' : '전체 판매 중 배달로 나가는 몫'}
          value={roundTo(share * 100, 0)} unit="%" step={10} min={0} max={100}
          onCommit={(v) => setDeliveryShare(v / 100)} />
        <div className={share === 0 ? 'st2-dim' : ''}>
          <NumField id="st2-rate" label="배달앱 수수료율" sub="중개·결제 수수료 합 · 최대 20%"
            value={roundTo((c.rate ?? 0) * 100, 1)} unit="%" step={0.5} min={0} max={20} decimals={1}
            onCommit={(v) => setRate(v / 100)} />
          <NumField id="st2-flat" label="건당 배달비" sub="가게가 내는 배달 대행비"
            value={c.flatFee ?? 0} unit="원" step={100} min={0} max={20000}
            onCommit={(v) => setFlatFee(v)} />
        </div>
        <NumField id="st2-pack" label="포장비" sub="용기·비닐·젓가락"
          value={c.packaging ?? 0} unit="원" step={10} min={0} max={10000}
          onCommit={(v) => setPackaging(v)} />
        <NumField id="st2-labor" label="그릇당 인건비" sub="조리·서빙에 드는 몫"
          value={c.labor ?? 0} unit="원" step={10} min={0} max={20000}
          onCommit={(v) => setLabor(v)} />
        <NumField id="st2-gas" label="가스·부자재" sub="가스비·세제·물티슈 등"
          value={c.gas ?? 0} unit="원" step={10} min={0} max={10000}
          onCommit={(v) => setGas(v)} />
      </div>
      <div className="st2-sum">
        <span>{won(sample || 9000)}원짜리 한 그릇이면</span>
        <b className="num">부대비용 {won(per)}원</b>
      </div>
    </Section>
  )
}

/* ── 4. 데이터 ───────────────────────────────────────────────── */
function DataSection() {
  const { exportData, importData, resetAll, storageOK, toast } = useStore()
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const doExport = () => {
    setErr('')
    try {
      const json = JSON.stringify(exportData(), null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `todayrecipe-백업-${today()}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 4000)
      toast('백업 파일을 저장했어요 · <b>다운로드 폴더</b>를 확인하세요')
    } catch {
      setErr('백업 파일을 만들지 못했어요. 다시 한 번 눌러 주세요.')
    }
  }

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''           // 같은 파일을 다시 골라도 동작하게
    if (!file) return
    setErr('')
    if (file.size > 10 * 1024 * 1024) { setErr('파일이 너무 커요. 이 앱에서 받은 백업 파일인지 확인해 주세요.'); return }
    setBusy(true)
    let obj
    try {
      const text = typeof file.text === 'function'
        ? await file.text()
        : await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsText(file) })
      obj = JSON.parse(text)
    } catch {
      setBusy(false)
      setErr('파일을 읽지 못했어요. 이 앱에서 내보낸 .json 백업 파일을 골라 주세요.')
      return
    }
    if (!window.confirm('지금 데이터를 덮어써요.\n지금 있는 가게·메뉴·판매 기록이 백업 파일 내용으로 바뀌어요. 계속할까요?')) {
      setBusy(false)
      return
    }
    const r = importData(obj) || { ok: false, why: '알 수 없는 오류예요' }
    if (r.ok) {
      toast(`불러왔어요 · 가게 <b>${r.stores}곳</b> · 메뉴 <b>${r.menus}개</b>`)
      setTimeout(() => window.location.reload(), 900)
    } else {
      setBusy(false)
      setErr(r.why || '불러오지 못했어요.')
    }
  }

  const doReset = () => {
    if (!window.confirm('처음 상태로 초기화할까요?\n가게·메뉴·판매 기록이 이 기기에서 모두 지워져요.')) return
    if (!window.confirm('정말요? 되돌릴 수 없어요.\n백업 파일이 없다면 [취소]를 누르고 먼저 내보내세요.')) return
    resetAll()
  }

  return (
    <Section ic="layers" title="데이터" delay={0.11}
      desc="서버 없이 이 기기에만 저장돼요. 폰을 바꾸기 전엔 꼭 백업하세요.">
      <div className={`st2-store${storageOK ? '' : ' warn'}`} role="status">
        {storageOK
          ? <><i className="st2-dot" />이 기기에 자동 저장 중</>
          : <><Icon name="info" size={16} stroke={2.2} /><span>이 브라우저는 저장이 막혀 있어요(사생활 보호 모드 등). 창을 닫으면 사라지니 <b>지금 백업 파일을 내보내</b> 두세요.</span></>}
      </div>
      <div className="st2-list">
        <button type="button" className="st2-row" onClick={doExport}>
          <span className="st2-row-ic"><Icon name="download" size={19} stroke={1.9} /></span>
          <span className="st2-row-tx"><b>백업 파일 내보내기</b><span>가게·메뉴·판매 기록을 파일 하나로 저장</span></span>
          <Icon name="chevR" size={18} stroke={2} className="st2-chev" />
        </button>
        <button type="button" className="st2-row" disabled={busy} onClick={() => fileRef.current && fileRef.current.click()}>
          <span className="st2-row-ic">
            {busy ? <Orb mood="connecting" size={20} tone="pine" label="백업 파일을 읽는 중" />
              : <Icon name="download" size={19} stroke={1.9} style={{ transform: 'rotate(180deg)' }} />}
          </span>
          <span className="st2-row-tx"><b>{busy ? '백업 파일 읽는 중…' : '백업에서 불러오기'}</b><span>내보낸 .json 파일로 되살리기</span></span>
          <Icon name="chevR" size={18} stroke={2} className="st2-chev" />
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
        <button type="button" className="st2-row danger" onClick={doReset}>
          <span className="st2-row-ic"><Icon name="trash" size={19} stroke={1.9} /></span>
          <span className="st2-row-tx"><b>처음 상태로 초기화</b><span>이 기기에 저장된 모든 데이터를 지워요</span></span>
          <Icon name="chevR" size={18} stroke={2} className="st2-chev" />
        </button>
      </div>
      {err && <p className="st2-errbox" role="alert"><Icon name="info" size={16} stroke={2.2} />{err}</p>}
    </Section>
  )
}

/* ── 5. 예시 데이터 안내 ─────────────────────────────────────── */
function SampleBanner() {
  const { viewingSample, setOnboarded } = useStore()
  if (!viewingSample) return null
  return (
    <section className="st2-sample fade">
      <div className="st2-sample-tx">
        <span className="st2-eyebrow">예시 데이터</span>
        <h2>지금은 예시 가게(행복분식)로 보는 중</h2>
        <p>숫자는 둘러보기용이에요. 내 가게로 시작하면 예시 가게는 치우고 우리 가게 숫자로 계산해요.</p>
      </div>
      <button type="button" className="st2-btn mint" onClick={() => setOnboarded(false)}>
        <Icon name="store" size={18} stroke={2} />내 가게로 시작하기
      </button>
    </section>
  )
}

/* ── 6. 출처·라이선스 ───────────────────────────────────────── */
function Credits() {
  const Y = YIELD_ATTRIBUTION || {}
  return (
    <Section ic="doc" title="출처·라이선스" delay={0.14} desc="계산에 쓴 자료와 화면에 쓴 공개 소프트웨어">
      <dl className="st2-cred">
        <div>
          <dt>조리 수율</dt>
          <dd>{Y.primary}</dd>
          <dd>{Y.secondary}</dd>
          <dd className="st2-note">{Y.note}</dd>
        </div>
        <div>
          <dt>UI 애니메이션</dt>
          <dd>thinking-orbs — MIT License, Jakub Antalik</dd>
        </div>
        <div>
          <dt>차트</dt>
          <dd>Bklit UI (MIT)</dd>
        </div>
      </dl>
    </Section>
  )
}

export default function Settings() {
  const nav = useNavigate()
  return (
    <div className="scroll">
      <div className="st2-wrap">
        <div className="hd fade">
          <h1 className="hd-title">설정</h1>
          <p className="hd-desc">여기서 바꾼 값이 원가·마진 계산에 바로 들어가요</p>
        </div>
        <SampleBanner />
        <StoreInfo />
        <FixedCosts />
        <Overheads />
        <DataSection />
        <Credits />
        <div className="st2-list st2-out fade">
          <button type="button" className="st2-row" onClick={() => nav('/')}>
            <span className="st2-row-ic"><Icon name="back" size={19} stroke={1.9} /></span>
            <span className="st2-row-tx"><b>소개 페이지 보기</b><span>오늘 몇 그릇? 소개 화면으로</span></span>
            <Icon name="chevR" size={18} stroke={2} className="st2-chev" />
          </button>
        </div>
        <p className="st2-ver">오늘 몇 그릇? · v1.1</p>
      </div>
    </div>
  )
}
