// 버전을 올리면 모든 사용자에게 자동으로 새 버전이 배포됩니다.
const CACHE_NAME = 'asan-v15';
const ASSETS = ['./icon-192.png','./icon-512.png','./manifest.json'];

// 설치: 새 서비스워커를 즉시 활성화
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(()=>{})));
});

// 활성화: 오래된 캐시 전부 삭제 + 즉시 제어권 가져오기
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))  // 모든 캐시 삭제
    ).then(() => self.clients.claim())
  );
});

// fetch
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // HTML 문서(index.html 등)는 항상 최신을 받아옴 (캐시 안 함)
  const isHTML = e.request.mode === 'navigate' ||
                 e.request.destination === 'document' ||
                 url.pathname.endsWith('.html') ||
                 url.pathname.endsWith('/');

  if (isHTML) {
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).catch(() => caches.match(e.request))
    );
    return;
  }

  // 그 외 자원: 네트워크 우선
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
