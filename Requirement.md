# Offline Food Ordering PWA (Push + Secure API)

> **Stack**: Frontend — Vite + React + TypeScript, Service Worker, Manifest, IndexedDB (idb).
> Backend — NestJS + TypeScript, Swagger/OpenAPI, File-based JSON store (lowdb) or SQLite (optional).
> Push — Web Push API with mocked VAPID keys in dev.

---

## 1) Project Title & Summary (README)

**Title:** Offline Food Ordering PWA

**Summary:** A mobile-first PWA for browsing a menu, adding to cart, and placing offline-capable orders. The app caches UI & content for offline use, stores cart/orders in IndexedDB, queues order submission with Background Sync, and uses Web Push to notify users about order status changes. A secure NestJS API exposes endpoints for menu, orders, push subscriptions.

---

## 2) Goals & Non-Goals

**Goals**

* Robust offline UX: cache-first app shell, stale-while-revalidate menu, background sync for order queue.
* Secure order flow: client-side escaping & validation, server-side DTO validation, simulated CSRF tokens, rate limiting, CORS.
* Push notifications for status updates (mock VAPID in dev).
* Clear API spec (Swagger) + sample Postman collection.
* Simple deploy path: single docker-compose for local; separate services in production.

**Non-Goals**

* Payments, inventory, or delivery logistics.
* Multi-tenant dashboards or roles beyond basic operator.

---

## 3) System Architecture Overview

```
[React PWA (Vite)]            [Service Worker]
  |  IndexedDB  <----------->  Cache Storage
  |           (cart/orders)
  |                               ^   ^
  | (fetch)                       |   | push
  v                               |   |
[NestJS API]  <------ HTTPS ----> [Browser]
  |  lowdb (JSON file) or SQLite
  |  Web Push (VAPID)
```

* **App Shell** cached on first load; **menu** served SWR; **orders** queued if offline.
* **Web Push**: backend stores subscriptions; sends status updates.

---

## 4) Technologies Used (README)

* **Frontend:** Vite, React, TypeScript, React Router, Redux Toolkit, idb (IndexedDB wrapper), Workbox or vite-plugin-pwa, DOMPurify.
* **Backend:** NestJS, class-validator/class-transformer, SQLite via TypeORM, @nestjs/swagger, web-push, helmet, rate-limiter-flexible.
* **Tooling:** ESLint, Prettier, Husky + lint-staged, Jest (unit), Playwright (e2e, optional), Docker.

---

## 5) Monorepo Structure (optional but recommended)

```
food-ordering/
  apps/
    frontend/                # Vite + React PWA
    backend/                # NestJS server
  packages/
    ui/                 # shared UI (optional)
    config/             # ESLint, tsconfig
  docker-compose.yml
  .editorconfig
```

---

## 6) Frontend Requirements (Vite + React)

### 6.1 Features

* Menu: list/grid with **dynamic filtering** (category, veg/non-veg, price range, search).
* Cart: add/remove/update quantity; **order summary** with itemized totals & taxes.
* Order Submission: create order → pending; show **status timeline** (Pending → Accepted → Preparing → Ready → Completed/Cancelled).
* Offline:

  * **Cache-first** app shell (HTML, CSS, JS, icons).
  * **SWR** (stale-while-revalidate) for `/menu`.
  * **Background Sync** for `/orders` if offline; retry with exponential backoff.
  * Show **queued orders** state and retry controls.
* Push Notifications: ask permission; register subscription with API; show updates.

### 6.2 Pages/Routes

* `/` — Menu (filters, add to cart)
* `/cart` — Cart + Checkout form (name, phone, address, notes) with **client-side validation & escaping**
* `/order/:orderId` — Order status page with realtime (polling or push-driven) updates
* `/settings` — Notifications toggle, Clear cache/IndexedDB, About


### 6.4 Service Worker + Manifest

* `vite-plugin-pwa` or Workbox:

  * Precache: app shell + critical assets.
  * Runtime caching:

    * `/api/menu` → SWR (CacheFirst with short max-age + revalidate in bg).
    * `/api/orders` → NetworkOnly + **Background Sync** queue when offline.
  * Push event handler: display notifications; click → open `/order/:id`.
* Web App Manifest: name, icons (192/512), theme\_color, background\_color, start\_url `/`, display `standalone`.



---

## 7) Backend Requirements (NestJS)

### 7.1 Modules

* `MenuModule`: CRUD on menu items (admin endpoints optional), cache headers.
* `OrdersModule`: create order, update status, get order by id, list orders (admin optional).
* `PushModule`: manage subscriptions; trigger status notifications.
* `HealthModule`: `/health` endpoint.

### 7.2 Persistence

* **Default:** lowdb (file-based JSON) with atomic writes; path `data/app.json`.
* **Optional:** SQLite via TypeORM.

### 7.4 API Design (OpenAPI)

* Swagger at `/docs` (Nest Swagger).
* Export `openapi.json` for Postman.

---

## 8) API Overview (README)

**Base URL (dev):** `http://localhost:3000/api`

### 8.1 Endpoints

* `GET /api/menu` — list menu items (query: `q`, `category`, `veg`, `minPrice`, `maxPrice`)
* `GET /api/menu/:id` — menu item details
* `POST /api/orders` — create order *(CSRF required)*
* `GET /api/orders/:id` — get order by id
* `PUT /api/orders/:id/status` — update status *(admin/mock only)*
* `POST /api/push/subscribe` — save push subscription *(CSRF required)*
* `DELETE /api/push/subscribe` — remove subscription *(CSRF required)*
* `GET /api/health` — liveness
* `GET /api/auth/csrf` — get token + set cookie

### 8.2 Sample Schemas (DTOs)

**MenuItem**

```json
{
  "id": "m_123",
  "name": "Margherita Pizza",
  "price": 499,
  "category": "pizza",
  "tags": ["veg"],
  "imageUrl": "/images/margherita.jpg",
  "available": true
}
```

**CreateOrderRequest**

```json
{
  "customer": {
    "name": "Alice",
    "phone": "+8801700000000",
    "address": "House 1, Road 2",
    "notes": "Extra cheese"
  },
  "items": [
    { "id": "m_123", "qty": 2 },
    { "id": "m_456", "qty": 1 }
  ]
}
```

**CreateOrderResponse**

```json
{
  "orderId": "o_789",
  "status": "PENDING",
  "etaMinutes": 30
}
```

**UpdateStatusRequest**

```json
{ "status": "PREPARING" }
```
- No user login required


## 10) Offline Strategy Details

* **Precache**: app shell, fonts, icons, critical images.
* **Runtime**:

  * Menu: CacheFirst with `stale-while-revalidate` via Workbox.
  * Orders: NetworkOnly; if offline, queue with Background Sync (`workbox-background-sync`).
* **IndexedDB**: store cart & queued orders; on regain network, drain queue.
* **Conflict Handling**: dedupe queued orders by payload hash; backoff retries (1s→60s).

---

## 11) Web Push (Mocked in Dev)

* Generate dev VAPID keys: `npx web-push generate-vapid-keys`.
* Store in `.env` (backend): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
* Client: obtain public key from `/api/push/publicKey` (optional helper) to create subscription.
* Backend: persist `endpoint`, `keys.p256dh`, `keys.auth` with order-anchored label; send notifications on status change.
* Notification payload example:

```json
{
  "title": "Order #o_789",
  "body": "Your order is PREPARING",
  "data": { "orderId": "o_789" }
}
```

---

## 12) How to Run (README)

### 12.1 Prereqs

* Node 20+
* pnpm (preferred) or npm

### 12.2 Env Vars (backend)

```
PORT=3000
DATA_FILE=./data/app.json
CORS_ORIGIN=http://localhost:5173
VAPID_PUBLIC_KEY=<dev_public>
VAPID_PRIVATE_KEY=<dev_private>
VAPID_SUBJECT=mailto:dev@example.com
RATE_LIMIT_POINTS=100
RATE_LIMIT_DURATION=60
```

### 12.3 Commands

```bash
# root
pnpm i
pnpm -C apps/api start:dev
pnpm -C apps/web dev
```

### 12.4 PWA Notes

* For service worker features on `localhost`, Vite dev is fine; for production SW testing, build & serve over HTTPS (or `localhost`).

---

## 13) API Documentation (Swagger + Postman)

* **Swagger**: auto-generated at `/docs` with schemas & examples.
* **OpenAPI JSON**: `/docs-json` for importing to Postman.
* **Postman Collection**: include `postman/quickbite.postman_collection.json` with example requests including CSRF dance.

### 13.1 Endpoint List (CRUD + Examples)

**Menu**

* `GET /api/menu`
* `GET /api/menu/:id`
* *(Optional admin)* `POST /api/menu`, `PUT /api/menu/:id`, `DELETE /api/menu/:id`

**Orders**

* `POST /api/orders` *(CSRF)* — create order
* `GET /api/orders/:id` — get order
* `PUT /api/orders/:id/status` *(mock/admin)* — update status → triggers push

**Push**

* `POST /api/push/subscribe` *(CSRF)* — save subscription
* `DELETE /api/push/subscribe` *(CSRF)* — delete subscription
* `GET /api/push/publicKey` — return VAPID public key

**Auth/Security**

* `GET /api/auth/csrf` — set `csrf` cookie & return token

**Health**

* `GET /api/health`

---

## 14) Data Models (Minimal)

```ts
// MenuItem
id: string; name: string; price: number; category: string; tags?: string[]; imageUrl?: string; available: boolean;

// Order
id: string; items: {id: string; qty: number;}[]; total: number; status: 'PENDING'|'ACCEPTED'|'PREPARING'|'READY'|'COMPLETED'|'CANCELLED';
customer: { name: string; phone: string; address?: string; notes?: string };
createdAt: string; updatedAt: string;

// PushSubscription
endpoint: string; keys: { p256dh: string; auth: string }; userHint?: string; orderIdHint?: string;
```

---

## 15) Security Details (Deeper)

* **CSRF**: double-submit cookie; token derived with HMAC(`CSRF_SECRET`, client nonce). Validate match & expiry.
* **XSS**: server strips HTML from text fields; client sanitizes display.
* **Rate Limiting**: 10/min for order creation; 30/min for reading order; 5/min for push subscribe.
* **CORS**: exact origin match + `OPTIONS` handling; reject credentials from unknown origins.
* **Headers**: Helmet defaults + `Cross-Origin-Resource-Policy: same-site` for images.

---

## 16) Analytics Setup (README)

* **Tool**: Plausible.
* Events: `add_to_cart`, `order_submitted`, `push_enabled`, `order_status_viewed`.
* Respect DNT; no PII; aggregate only.

---

## 17) Roles of Group Members (README)

* **Lead Frontend (Name)**: PWA, SW, UI/UX, IndexedDB.
* **Lead Backend (Name)**: API, data store, CSRF, push.
* **QA/Docs (Name)**: Swagger+Postman, README, test plans.
* **DevOps (Name)**: Docker, CI, deployment scripts.

---

## 18) Acceptance Criteria

* Lighthouse PWA score ≥ 90 on mobile.
* Full offline: app shell + menu visible; cart usable; orders queued when offline and auto-submitted on reconnect.
* Push notifications displayed on status change.
* CSRF protection enforced on POST/PUT/DELETE.
* Swagger docs complete; Postman collection works end-to-end.

---

## 19) Testing Strategy

* **Unit**: DTO validation, services (order total calc, status transitions), CSRF utils.
* **Integration**: API routes with Supertest; file store adapter.
* **E2E (optional)**: Playwright—offline mode, background sync, push prompt flow (mock).

---

## 20) Deployment Notes

* **Dev**: docker-compose with two services (`web`, `api`).
* **Prod**: separate containers; HTTPS via reverse proxy (Nginx/Caddy); persistent volume for `data/app.json`.

---

## 21) API Swagger Hints (NestJS)

```ts
// main.ts
const config = new DocumentBuilder()
  .setTitle('QuickBite API')
  .setDescription('Offline Food Ordering API with CSRF & Push')
  .setVersion('1.0.0')
  .addTag('menu').addTag('orders').addTag('push')
  .addCookieAuth('csrf', { type: 'apiKey', in: 'cookie' })
  .addApiKey({ type: 'apiKey', name: 'x-csrf-token', in: 'header' }, 'csrf-token')
  .build();
```

---

## 22) Sample cURL (CSRF + Order)

```bash
# 1) Get CSRF (sets cookie)
curl -i http://localhost:3000/api/auth/csrf
# Read token from JSON response: {"token":"..."}
# 2) Create order with header + cookie
curl -i -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: <token>" \
  --cookie "csrf=<token>" \
  --data '{
    "customer": {"name": "Alice", "phone": "+8801700000000"},
    "items": [{"id":"m_123","qty":2}]
  }'
```

---

## 23) Timeline (Suggested)

* **Week 1**: Scaffold repos, core UI, SW precache, Menu API.
* **Week 2**: Cart + Checkout, IndexedDB, Orders API, CSRF.
* **Week 3**: Background Sync, Push subscriptions & notifications, Swagger+Postman.
* **Week 4**: Testing, analytics, polish, Lighthouse targets.

---

## 24) Deliverables Checklist

* [ ] PWA with install prompt, icon, manifest, SW
* [ ] Offline menu & cart
* [ ] Background-synced order queue
* [ ] Push notifications wired (mock VAPID)
* [ ] README (all sections), Swagger.
* [ ] Basic docker-compose for local

---

*End of requirements.md*
