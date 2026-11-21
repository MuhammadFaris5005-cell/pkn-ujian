/* Pengembaraan Kata Nama v5.4: service worker untuk LUAR TALIAN (GitHub Pages).
   Letakkan fail ini di sebelah index.html. Selepas halaman dibuka sekali dengan internet, salinannya disimpan dalam peranti;
   tanpa internet, salinan itu dipaparkan. Apabila ada internet, versi terbaharu sentiasa dimuat dahulu (rangkaian diutamakan),
   jadi kemas kini pada GitHub tidak tersekat oleh salinan lama. Hanya permintaan GET dari laman yang sama disimpan.
   v5.4 PWA (21 Nov 2026): nama cache dinaikkan ke v2; manifest dan ikon aplikasi disimpan semasa pemasangan.
   Halaman yang sudah disimpan dalam cache lama dipindahkan dahulu (tanpa muat turun semula) sebelum cache lama dipadam. */
const CACHE = "pkn-luar-talian-v2";
const SIMPAN_AWAL = ["./", "manifest.webmanifest", "ikon/ikon-192.png", "ikon/ikon-512.png",
  "ikon/ikon-maskable-192.png", "ikon/ikon-maskable-512.png", "ikon/apple-touch-icon.png"];
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SIMPAN_AWAL.map(u => {
    const url = new URL(u, location).href;
    return caches.match(url, { ignoreSearch: true }).then(lama => lama ? c.put(url, lama)
      : fetch(url).then(res => { if (res && res.ok) return c.put(url, res); })).catch(() => {});
  }))).catch(() => {}));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith("pkn-") && n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res && res.ok && res.type === "basic") { const salin = res.clone(); caches.open(CACHE).then(c => c.put(r, salin)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m ||
    (r.mode === "navigate" ? caches.match(new URL("./", location).href).then(x => x || caches.match(new URL("index.html", location).href)) : undefined))
    .then(m => m || new Response("Luar talian: halaman belum disimpan. Buka sekali dengan internet dahulu.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }))));
});
