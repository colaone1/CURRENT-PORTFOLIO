const CURRENT_CACHE = 'portfolio-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/tailwind.css',
    '/styles.css',
    '/scripts.js',
    '/images/Logos/logo.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CURRENT_CACHE)
            .then(cache => {
                // Add files one by one to handle missing files gracefully
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
