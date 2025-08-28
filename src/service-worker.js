/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Ten service worker może kontrolować stronę od razu po aktywacji.
clientsClaim();

// Precache wszystkich zasobów z manifestu wygenerowanego przez build.
// To sprawia, że Twoja aplikacja (tzw. App Shell) działa offline.
precacheAndRoute(self.__WB_MANIFEST);

// Ustawia obsługę dla strony głównej (index.html).
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
    // Zwraca index.html dla wszystkich żądań, które nie są ścieżkami (np. /cats)
    // i nie są plikami (nie mają kropki w nazwie).
    ({ request, url }) => {
        if (request.mode !== 'navigate') {
            return false;
        }
        if (url.pathname.startsWith('/_')) {
            return false;
        }
        if (url.pathname.match(fileExtensionRegexp)) {
            return false;
        }
        return true;
    },
    createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Przykładowa strategia cache'owania dla zasobów, np. obrazków.
// Używa strategii "Stale-While-Revalidate":
// 1. Najpierw próbuje podać plik z cache (szybko).
// 2. W tle wysyła żądanie do sieci po nową wersję i aktualizuje cache.
registerRoute(
    ({ url }) => url.origin === self.location.origin && (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.jpeg')),
    new StaleWhileRevalidate({
        cacheName: 'images',
        plugins: [
            // Usuwa z cache obrazy nieużywane przez 30 dni.
            new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        ],
    })
);

// To pozwala service workerowi przejąć kontrolę i obsłużyć aktualizacje
// natychmiast po znalezieniu nowej wersji.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});