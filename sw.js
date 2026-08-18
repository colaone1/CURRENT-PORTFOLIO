const CURRENT_CACHE = 'portfolio-cache-v12';
const urlsToCache = [
    '/',
    '/index.html',
    '/tailwind.css',
    '/styles.css?v=35',
    '/fonts.css?v=3',
    '/fonts/lexend-500.woff2',
    '/fonts/lexend-700.woff2',
    '/fonts/cinzel-600.woff2',
    '/fonts/rajdhani-700.woff2',
    '/scripts.js?v=20',
    '/images/Logos/logo.png',
    '/vendor/fontawesome/css/icons.min.css',
    '/vendor/fontawesome/webfonts/fa-solid-900.woff2',
    '/vendor/fontawesome/webfonts/fa-brands-400.woff2'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CURRENT_CACHE)
            .then(cache => {
                return Promise.allSettled(
                    urlsToCache.map(url => cache.add(url).catch(err => {
                        console.log('Failed to cache:', url, err);
                        return null;
                    }))
                );
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CURRENT_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch handler remains disabled to avoid navigation/DNS loop issues previously observed.
// Precache above still warms critical assets for browsers that read the SW cache API directly.
