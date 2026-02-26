/* ============================================================
   SERVICE WORKER — Job Analyzer Platform PWA
   Strategy: Cache-First for assets, Network-First for API/Supabase
   ============================================================ */

const CACHE_NAME = "job-analyzer-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/static/css/main.chunk.css",
  "/favicon.ico",
  "/apple-touch-icon.png"
];

/* ── INSTALL: Pre-cache critical shell assets ── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silently ignore if some assets are not found (dev vs prod paths differ)
      });
    })
  );
  self.skipWaiting(); // Activate new SW immediately
});

/* ── ACTIVATE: Clean up old caches ── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // Take control of all open tabs
});

/* ── FETCH: Smart routing strategy ── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests (POST, PUT, DELETE — Supabase writes)
  if (request.method !== "GET") return;

  // 2. Skip Supabase API calls — always go to network
  if (url.hostname.includes("supabase.co")) return;

  // 3. Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") return;

  // 4. For navigate requests (HTML pages) — Network-First with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a fresh copy of index.html
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() => {
          // Offline: serve cached index.html for SPA routing
          return caches.match("/index.html").then(
            (cached) => cached || new Response("Offline - Please reconnect", { status: 503 })
          );
        })
    );
    return;
  }

  // 5. For static assets (JS, CSS, fonts, images) — Cache-First
  if (
    url.pathname.startsWith("/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        });
      })
    );
    return;
  }

  // 6. Everything else — Network-First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

/* ── PUSH NOTIFICATIONS (future-ready) ── */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "Job Analyzer", {
    body: data.body || "You have a new update!",
    icon: "/logo192.png",
    badge: "/logo192.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/")
  );
});