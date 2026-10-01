// Bump VERSION whenever you change any file so phones pick up the update.
const VERSION = "arc-v1";
const FILES = [
  "./", "index.html", "manifest.webmanifest",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
  "fonts/barlow-condensed-latin-500-normal.woff2", "fonts/barlow-condensed-latin-600-normal.woff2",
  "fonts/barlow-condensed-latin-700-normal.woff2", "fonts/barlow-latin-400-normal.woff2",
  "fonts/barlow-latin-500-normal.woff2", "fonts/barlow-latin-600-normal.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Page: network first so updates arrive, cache when offline. Everything else: cache first.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
