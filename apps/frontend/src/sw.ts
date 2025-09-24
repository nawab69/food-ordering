/* eslint-disable no-restricted-globals */
/// <reference lib="webworker" />

// Custom service worker (injectManifest)

// workbox precaching placeholder required for injectManifest
// The plugin will replace __WB_MANIFEST with the precache manifest at build time
// We import from workbox-precaching which is bundled by the plugin
// @ts-ignore - types provided by plugin during build
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any };

// Precache build assets
// @ts-ignore - __WB_MANIFEST injected at build
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Cache strategies for different types of requests
self.addEventListener('fetch', (event: FetchEvent) => {
    const { request } = event;
    const url = new URL(request.url);

    // Menu API - Cache First with background update
    if (url.pathname.includes('/api/menu')) {
        event.respondWith(
            caches.open('menu-cache').then(cache => {
                return cache.match(request).then(response => {
                    // Return cached version immediately
                    if (response) {
                        console.log('Serving menu from cache');
                        // Update cache in background
                        fetch(request).then(fetchResponse => {
                            if (fetchResponse.ok) {
                                cache.put(request, fetchResponse.clone());
                                console.log('Menu cache updated in background');
                            }
                        }).catch(() => {
                            console.log('Background menu update failed');
                        });
                        return response;
                    }

                    // If no cache, fetch and cache
                    return fetch(request).then(fetchResponse => {
                        if (fetchResponse.ok) {
                            cache.put(request, fetchResponse.clone());
                            console.log('Menu cached for offline use');
                        }
                        return fetchResponse;
                    }).catch(() => {
                        // If network fails, try to return any cached version
                        return cache.match(request).then(cachedResponse => {
                            if (cachedResponse) {
                                console.log('Network failed, serving stale menu from cache');
                                return cachedResponse;
                            }
                            // Return offline fallback
                            return new Response(JSON.stringify([]), {
                                headers: { 'Content-Type': 'application/json' }
                            });
                        });
                    });
                });
            })
        );
        return;
    }

    // Orders API - Network only (no caching for orders)
    if (url.pathname.includes('/api/orders')) {
        event.respondWith(
            fetch(request).catch(() => {
                // Return offline indicator for orders
                return new Response(JSON.stringify({
                    error: 'Offline - Order will be queued for later submission'
                }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Static assets - Cache First
    if (request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image') {
        event.respondWith(
            caches.match(request).then(response => {
                return response || fetch(request).then(fetchResponse => {
                    if (fetchResponse.ok) {
                        const responseClone = fetchResponse.clone();
                        caches.open('static-cache').then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return fetchResponse;
                });
            })
        );
        return;
    }
});

// Push notifications
self.addEventListener('push', (event: PushEvent) => {
    console.log('Push event received:', event);

    const data = (() => {
        try {
            return event.data ? JSON.parse(event.data.text()) : {};
        } catch (e) {
            console.error('Failed to parse push data:', e);
            return {};
        }
    })();

    console.log('Push data:', data);

    const title = data.title || 'Order Update';
    const options: NotificationOptions = {
        body: data.body || 'You have a new update',
        icon: data.icon || '/vite.svg',
        badge: data.badge || '/vite.svg',
        data: data.data || {},
        requireInteraction: false,
        silent: false,
    };

    console.log('Showing notification:', title, options);

    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(() => console.log('Notification shown successfully'))
            .catch((err) => console.error('Failed to show notification:', err))
    );
});

// Notification click → focus or open order page
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    const orderUrl = (() => {
        const data: any = event.notification?.data || {};
        if (data.url) return data.url as string;
        if (data.orderId) return `/order/${data.orderId}`;
        return '/';
    })();

    event.notification.close();

    event.waitUntil((async () => {
        const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of allClients) {
            const url = new URL((client as WindowClient).url);
            if (url.pathname === orderUrl && 'focus' in client) {
                return (client as WindowClient).focus();
            }
        }
        if (self.clients.openWindow) {
            return self.clients.openWindow(orderUrl);
        }
    })());
});

export { };


