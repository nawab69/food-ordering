### Push Notifications

Implemented push notifications end-to-end.

Frontend:
- Custom SW at `apps/frontend/src/sw.ts` with `push` and `notificationclick` handlers.
- PWA configured with `injectManifest` in `vite.config.ts`.
- UI toggle in `apps/frontend/src/components/PushToggle.tsx` to request permission, subscribe via VAPID, and unsubscribe.
- Integrated toggle into `Menu` header.

Backend:
- Push endpoints: `POST /api/push/subscribe`, `DELETE /api/push/subscribe`, `GET /api/push/publicKey`.
- Notifications sent on order creation and status update.
- Icons use existing `/vite.svg` for dev.

Usage:
1) Build and preview frontend so SW is active:
```bash
pnpm -C apps/frontend build && pnpm -C apps/frontend preview
```
2) In the app header, click "Enable Notifications". Grant permission.
3) When an order is created or its status is updated, a notification appears. Clicking it focuses/opens the order page.

Notes:
- For production, add PNG icons under `public/icons/` and update the manifest and payloads.
- Requires HTTPS or localhost for push.

