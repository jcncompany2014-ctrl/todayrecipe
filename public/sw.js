/* 서비스워커 — 주방에서 신호가 약해도 앱이 열리게 한다.
   원칙: 화면(HTML)은 항상 최신을 먼저 시도하고, 자산은 캐시를 먼저 쓴다.
   VERSION을 올리면 옛 캐시는 전부 정리된다. */
const VERSION = 'v1'
const SHELL_CACHE = 'todayrecipe-shell-' + VERSION
const ASSET_CACHE = 'todayrecipe-asset-' + VERSION
const SHELL_URL = '/'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then((c) => c.add(SHELL_URL))
      .catch(() => {})            // 셸을 못 받아도 설치는 진행
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('todayrecipe-') && !k.endsWith(VERSION))
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

const isAsset = (url) =>
  /\.(?:js|css|woff2?|png|jpe?g|webp|svg|ico)$/i.test(url.pathname) ||
  url.origin === 'https://cdn.jsdelivr.net'

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  let url
  try { url = new URL(req.url) } catch { return }

  // 화면 이동 — 네트워크 우선. 끊겼으면 캐시된 셸로라도 연다.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.put(SHELL_URL, copy)).catch(() => {}))
          return res
        })
        .catch(() => caches.match(SHELL_URL).then((r) => r || Response.error()))
    )
    return
  }

  // 자산 — 캐시 우선(파일명에 해시가 있어 낡을 일이 없다), 없으면 받아서 저장.
  if (isAsset(url)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit
        return fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone()
            e.waitUntil(caches.open(ASSET_CACHE).then((c) => c.put(req, copy)).catch(() => {}))
          }
          return res
        })
      }).catch(() => caches.match(req))
    )
  }
})
