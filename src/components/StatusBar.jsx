export default function StatusBar() {
  return (
    <div className="statusbar">
      <span className="num">9:41</span>
      <div className="sb-right">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M1 4.2C3.2 2.4 5.7 1.4 8.5 1.4S13.8 2.4 16 4.2" /><path d="M3.6 6.9c1.4-1.1 3.1-1.7 4.9-1.7s3.5.6 4.9 1.7" /><path d="M6.2 9.5c.7-.5 1.5-.8 2.3-.8s1.6.3 2.3.8" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="21" height="10" rx="3" stroke="currentColor" strokeWidth="1.2" opacity=".5" /><rect x="2.8" y="2.8" width="15" height="6.4" rx="1.6" fill="currentColor" /><rect x="23" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".5" /></svg>
      </div>
    </div>
  )
}
