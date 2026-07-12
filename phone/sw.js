self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    // Basic service worker pass-through to satisfy PWA criteria
});
