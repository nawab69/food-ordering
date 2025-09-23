### Order Status Page

Implements `/order/:orderId` route with real-time order tracking.

**Features:**
- Visual timeline showing order progression (PENDING → ACCEPTED → PREPARING → READY → COMPLETED)
- Auto-polling every 5 seconds for status updates
- Order details, customer info, and ETA display
- "Track Order" button in checkout success flow
- Navigation back to menu

**Files:**
- `apps/frontend/src/components/OrderStatus.tsx` - Main component with timeline and polling
- Route added in `apps/frontend/src/App.tsx`
- Integration in `apps/frontend/src/components/Checkout.tsx`

**Usage:**
1. Complete an order in checkout
2. Click "Track Order" to view status page
3. Page auto-refreshes every 5 seconds
4. Push notifications also update the status

**Status Flow:**
- PENDING (yellow) - Order placed
- ACCEPTED (blue) - Restaurant confirmed  
- PREPARING (purple) - Food being prepared
- READY (green) - Ready for pickup
- COMPLETED (green) - Delivered
- CANCELLED (red) - Order cancelled

**API Integration:**
- Uses `useGetOrderQuery` with polling
- Displays order items, total, customer details
- Shows ETA and creation timestamp
