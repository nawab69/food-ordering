### Settings Page

Implements `/settings` route with:
- Notifications toggle (push subscribe/unsubscribe)
- Clear Cache Storage and IndexedDB
- About block

Files:
- `apps/frontend/src/components/Settings.tsx`
- `apps/frontend/src/components/PushToggle.tsx`
- Route added in `apps/frontend/src/App.tsx`
- Navigation button added in `apps/frontend/src/components/Menu.tsx`

Notes:
- Clearing storage removes all service worker caches and IndexedDB databases (prototype-safe).
- Push toggle requires SW + VAPID public key to be configured.

