/**
 * Naskah Editor — Service Worker
 *
 * Strategi cache:
 *   - JS/CSS bundles, fonts, sprites → CacheFirst (konten statis, di-version per build)
 *   - HTML (index.html, index_loader.html) → NetworkFirst (bisa update tanpa clear cache)
 *   - Semua request lain → NetworkOnly
 *
 * Cache dipisah per CACHE_VERSION sehingga deploy baru otomatis
 * membersihkan cache lama lewat activate event.
 */

'use strict';

const CACHE_VERSION = self.__CACHE_VERSION || 'naskah-v1';
const CACHE_STATIC  = `${CACHE_VERSION}-static`;
const CACHE_HTML    = `${CACHE_VERSION}-html`;

// Pola URL yang masuk cache statis (CacheFirst)
const STATIC_PATTERNS = [
  /\/apps\/(documenteditor|spreadsheeteditor|presentationeditor|pdfeditor)\/main\/(app|code)\.js$/,
  /\/apps\/(documenteditor|spreadsheeteditor|presentationeditor|pdfeditor)\/main\/resources\/css\//,
  /\/apps\/(documenteditor|spreadsheeteditor|presentationeditor|pdfeditor)\/main\/resources\/img\//,
  /\/apps\/common\//,
  /\/vendor\//,
  /\.(woff2?|ttf|eot|otf)(\?.*)?$/,
  /\.(png|jpg|jpeg|svg|gif|webp)$/,
];

// Pola URL yang pakai NetworkFirst (HTML)
const HTML_PATTERNS = [
  /\/apps\/(documenteditor|spreadsheeteditor|presentationeditor|pdfeditor)\/main\/index(_loader)?\.html$/,
];

// ─── Install ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  // Aktifkan SW baru segera tanpa menunggu tab lama tertutup
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_STATIC && key !== CACHE_HTML)
          .map((key) => {
            console.log('[SW] Hapus cache lama:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Hanya handle GET
  if (request.method !== 'GET') return;

  // Abaikan request ke domain lain (API, R2, dsb)
  if (!url.startsWith(self.location.origin)) return;

  if (matchesAny(url, HTML_PATTERNS)) {
    event.respondWith(networkFirst(request, CACHE_HTML));
    return;
  }

  if (matchesAny(url, STATIC_PATTERNS)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Default: network only (tidak di-cache)
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchesAny(url, patterns) {
  return patterns.some((p) => p.test(url));
}

/**
 * CacheFirst: kembalikan dari cache jika ada, fallback ke network dan simpan.
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] CacheFirst gagal:', request.url, err);
    return new Response('Network error', { status: 503 });
  }
}

/**
 * NetworkFirst: coba network dulu, simpan ke cache, fallback ke cache jika gagal.
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}
