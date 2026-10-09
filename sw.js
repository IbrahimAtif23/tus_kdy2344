/* TUS Çalışma Arkadaşı - service worker (çevrimdışı + kurulabilirlik) */
var CACHE = "tus-app-v27";
var CORE = ["./", "./index.html", "./app.js", "./tailwind.css", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png", "./icon-180.png"];
self.addEventListener("install", function (e) {
  // cache: "reload" → tarayıcının HTTP önbelleğini atla, sunucudan taze dosya al (eski app.js'in yeni sürüm diye kaydedilmesini önler)
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(CORE.map(function (u) { return fetch(new Request(u, { cache: "reload" })).then(function (r) { if (r && r.ok) return c.put(u, r); }).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  // Sayfa açılışı: önce ağ (yeni sürüm hemen gelsin), çevrimdışıysa önbellek
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, { cache: "no-store" }).catch(function () { return caches.match("./index.html"); }));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      });
    })
  );
});
