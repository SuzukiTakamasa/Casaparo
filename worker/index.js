// Custom service worker code bundled into sw.js by next-pwa (customWorkerDir: 'worker').
// This file is imported at the TOP of the generated sw.js, so its fetch listener
// runs before Workbox and can repair the navigation before Workbox handles it.

// --- Repair for raw RSC (.txt) navigations behind Cloudflare Access ---
//
// This app is a static export (output: 'export'), so every route emits both
// `<route>.html` and `<route>.txt` (the RSC / flight payload). Next.js' App
// Router fetches `<route>.txt` on client-side navigation. When Cloudflare Access
// interrupts that RSC fetch with an auth redirect (e.g. right after login, while
// the session cookie is still settling), the router falls back to a hard
// navigation whose target resolves to the `.txt` file. The browser then loads
// `<route>.txt` as a document and renders the raw flight payload as plain text.
//
// A real user navigation never points at a `.txt`, so whenever a top-level
// navigation lands on one we redirect back to the clean HTML route.
self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.mode !== 'navigate') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (!url.pathname.endsWith('.txt')) return

  // Strip the ".txt" suffix. "/index.txt" and "/.txt" map back to "/".
  let pathname = url.pathname.slice(0, -'.txt'.length)
  if (pathname === '' || pathname === '/index') {
    pathname = '/'
  }

  const target = pathname + url.search + url.hash
  event.respondWith(Response.redirect(target, 302))
})

// --- Web Push handlers (moved here from public/service-worker.js) ---
self.addEventListener('push', (event) => {
  const data = event.data.json()
  const title = data.title
  const options = {
    body: data.body,
    icon: data.icon,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
})
