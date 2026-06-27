// 버전을 올리면 모든 사용자에게 자동으로 새 버전이 배포됩니다.
const CACHE_NAME = 'asan-v5';
const ASSETS = ['./index.html','./icon-192.png','./icon-512.png','./manifest.json'];

// 설치: 새 서비스워커를 즉시 활성화
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(()=>{})));
});

// 활성화: 오래된 캐시 삭제 + 즉시 제어권 가져오기
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// fetch: 네트워크 우선 (Network First)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
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
