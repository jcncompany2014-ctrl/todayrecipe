import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { TrendTri } from '../components/Icon'
import Thumb from '../components/Thumb'
import Photo from '../components/Photo'
import { useStore } from '../state/store'
import { PRODUCTS, CATS, POPULAR, SECTIONS } from '../data/catalog'
import { summarize, won, round10 } from '../lib/calc'

const CAT_TABS = [['all', '전체'], ['meat', '정육'], ['sea', '수산'], ['veg', '청과'], ['sauce', '양념'], ['etc', '기타']]

function Trend({ t }) {
  if (t[0] === 'fl') return <span className="trend fl">시세 보통</span>
  const dir = t[0]
  return <span className={`trend ${dir}`}><TrendTri dir={dir} />{t[1]}% {dir === 'dn' ? '저렴' : '비쌈'}</span>
}

export default function Market() {
  const nav = useNavigate()
  const { build, inBuild, toggleItem, setPrice, toast } = useStore()
  const [cat, setCat] = useState('all')

  const { food, margin } = summarize(build.items, build.price)

  const handleToggle = (id) => {
    const has = inBuild(id)
    const p = PRODUCTS[id]
    const before = summarize(build.items, build.price).margin
    const next = has ? build.items.filter((i) => i.id !== id) : [...build.items, { id, grams: p.defG, method: p.method }]
    const after = summarize(next, build.price).margin
    toggleItem(id)
    toast(`<b>${p.nm}</b> ${has ? '뺐어요' : '담음'} · 예상 마진 ${before}% → ${after}%`)
  }

  const sections = cat === 'all' ? SECTIONS : SECTIONS.filter((s) => s.cat === cat)

  return (
    <>
      <div className="scroll">
        <div className="mkt-head fade">
          <div className="mh-top">
            <button className="iconbtn" aria-label="뒤로" onClick={() => nav('/app')}><Icon name="back" size={22} stroke={2} /></button>
            <span className="mh-title">재료 담기</span>
          </div>
          <button className="chip" onClick={() => toast('메뉴를 바꾸거나 새로 만들 수 있어요')}>
            <span className="chip-ic"><Photo src={build.img} icon={build.icon || 'bowl'} iconSize={16} /></span>
            <span className="chip-tx"><b>{build.nm}</b><span>담는 중</span></span>
            <Icon name="chevD" size={16} stroke={2} className="cd" />
          </button>
          <div className="search">
            <Icon name="search" size={18} stroke={2} />
            <input placeholder="삼겹살, 양파, 고추장…" readOnly />
          </div>
        </div>

        <div className="catbar">
          <div className="cats">
            {CAT_TABS.map(([k, label]) => (
              <button key={k} className={`cat${cat === k ? ' on' : ''}`} onClick={() => setCat(k)}>{label}</button>
            ))}
          </div>
        </div>

        {cat === 'all' && (
          <>
            <div className="sec-head"><h2>사장님이 많이 담아요</h2><span className="more">더보기 ›</span></div>
            <div className="hscroll">
              {POPULAR.map((id) => {
                const p = PRODUCTS[id]
                return (
                  <div key={id} className="hcard">
                    <div className="himg" style={{ background: CATS[p.cat].g }}>
                      <Thumb product={p} iconSize={56} />
                      <button className={`add${inBuild(id) ? ' in' : ''}`} aria-label="담기"
                        onClick={(e) => { e.stopPropagation(); handleToggle(id) }}>
                        <Icon name={inBuild(id) ? 'check' : 'plus'} size={19} stroke={2.4} />
                      </button>
                    </div>
                    <div className="hcard-tx">
                      <div className="nm">{p.nm}</div>
                      <div className="pr num">{won(p.price)}원<i>{p.unit}</i></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {sections.map((sec) => (
          <div key={sec.cat} className="vsec">
            <div className="sec-head"><h2>{CATS[sec.cat].label}</h2></div>
            <div className="vlist">
              {sec.ids.map((id) => {
                const p = PRODUCTS[id]
                return (
                  <div key={id} className="vitem">
                    <div className="vthumb" style={{ background: CATS[p.cat].g }}><Thumb product={p} iconSize={34} /></div>
                    <div className="vmid">
                      <div className="nm">{p.nm}</div>
                      <div className="pr num">{won(p.price)}원<i>{p.unit}</i></div>
                      <Trend t={p.trend} />
                    </div>
                    <button className={`addv${inBuild(id) ? ' in' : ''}`} aria-label="담기" onClick={() => handleToggle(id)}>
                      <Icon name={inBuild(id) ? 'check' : 'plus'} size={20} stroke={2.4} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button className={`cartbar${build.items.length === 0 ? ' hide' : ''}`} onClick={() => nav('/app/cart')}>
        <div className="cb-left">
          <span className="cb-cart">
            <Icon name="cart" size={20} stroke={1.8} />
            <span className="cb-badge num">{build.items.length}</span>
          </span>
          <span className="cb-tx">
            <span className="l1">장바구니 {build.items.length}개</span>
            <span className="l2 num">식자재 {won(round10(food))}원</span>
          </span>
        </div>
        <div className="cb-right">
          <span className="cb-margin"><span>예상 마진</span><b className="num">{margin}%</b></span>
          <Icon name="chevR" size={18} stroke={2.2} className="cr" />
        </div>
      </button>
    </>
  )
}
