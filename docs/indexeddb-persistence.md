### IndexedDB Persistence

Implements persistent storage for cart and orders using IndexedDB via the `idb` library.

**Features:**
- Cart persistence: Items saved automatically on add/remove/update
- Order history: Completed orders stored locally
- Menu items cache: Offline menu browsing
- Settings integration: Clear all data option

**Files:**
- `apps/frontend/src/services/persistence.service.ts` - IndexedDB service with idb
- `apps/frontend/src/store/slices/cartSlice.ts` - Cart persistence integration
- `apps/frontend/src/components/Menu.tsx` - Cart loading on mount
- `apps/frontend/src/components/Checkout.tsx` - Order saving
- `apps/frontend/src/components/Settings.tsx` - Clear data option

**Database Schema:**
- `cart` store: Cart items array
- `orders` store: Order objects with full details
- `menuItems` store: Cached menu items for offline use

**Usage:**
- Cart automatically persists across browser sessions
- Orders saved when completed via checkout
- Settings page can clear all stored data
- Works offline with cached menu items

**API Methods:**
- `saveCart(items)` - Persist cart items
- `loadCart()` - Restore cart from storage
- `saveOrder(order)` - Store completed order
- `loadOrders()` - Get order history
- `clearAllData()` - Wipe all stored data

**Benefits:**
- Offline cart persistence
- Order history tracking
- Better user experience
- Reduced API calls for cached data
