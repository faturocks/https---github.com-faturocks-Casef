/**
 * Service Worker for Los Santos Penal Code
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'penal-code-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'css/styles.css',
    'js/app.js',
    'js/language.js',
    'js/theme.js',
    'js/search.js',
    'js/toc.js',
    'data/penal-code-en.json',
    'data/penal-code-id.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker...');
    
    // Skip waiting to ensure the new service worker activates immediately
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell and content');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(error => {
                console.error('[Service Worker] Cache addAll failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating Service Worker...');
    
    // Claim clients to ensure the SW is in control immediately
    event.waitUntil(self.clients.claim());
    
    // Clean up old caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.startsWith('https://fonts.googleapis.com') && 
        !event.request.url.startsWith('https://fonts.gstatic.com') && 
        !event.request.url.startsWith('https://cdn.tailwindcss.com')) {
        return;
    }
    
    // For HTML requests, use network-first strategy
    if (event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the latest version
                    let responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, serve from cache
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // For JSON data files, use stale-while-revalidate strategy
    if (event.request.url.endsWith('.json')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request)
                        .then(networkResponse => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        })
                        .catch(error => {
                            console.error('[Service Worker] Fetch failed:', error);
                        });
                    
                    // Return cached response immediately, then update cache in background
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }
    
    // For all other requests, use cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached response
                    return cachedResponse;
                }
                
                // If not in cache, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Cache the new response
                        let responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                        return response;
                    });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});