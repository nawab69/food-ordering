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


