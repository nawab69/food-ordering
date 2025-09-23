# Frontend-Backend Integration Documentation

## Overview
This document describes the complete integration between the React frontend and NestJS backend for the Food Ordering PWA. The integration includes real-time API calls, CSRF protection, order management, and comprehensive error handling.

## Integration Architecture

### API Communication Flow
```
React Frontend (localhost:5173)
    ↓ RTK Query
    ↓ CSRF Token + Cookies
    ↓
NestJS Backend (localhost:3000/api)
    ↓ LowDB
    ↓
JSON File Storage (./data/app.json)
```

## Key Features Implemented

### 1. Real-Time Menu Data ✅
**Replaced mock data with live API calls**

- **Frontend**: `useGetMenuItemsQuery()` hook fetches real menu data
- **Backend**: Returns 13 pre-loaded menu items across 5 categories
- **Filtering**: Real-time search and category filtering via API parameters
- **Data Flow**: API params → Backend filtering → Live results

**Example API Call:**
```typescript
const { data: menuItems, isLoading, error } = useGetMenuItemsQuery({
  q: searchTerm,
  category: selectedCategory !== "all" ? selectedCategory : undefined
});
```

### 2. CSRF Security Implementation ✅
**Complete CSRF protection for all mutations**

- **Token Generation**: Backend generates cryptographically signed tokens
- **Double-Submit Cookies**: Token in both header and HTTP-only cookie
- **Auto-Refresh**: Frontend automatically fetches new tokens when needed
- **Error Handling**: Automatic retry on token expiration

**CSRF Service Features:**
```typescript
class CsrfService {
  async getCsrfToken(): Promise<string>
  async ensureCsrfToken(): Promise<void>
  clearToken(): void
}
```

### 3. Order Creation & Management ✅
**Complete order workflow from cart to confirmation**

**Order Flow:**
1. **Add to Cart** → Redux state management
2. **Checkout Form** → Customer details + validation
3. **CSRF Token** → Automatic security token handling
4. **API Submission** → Protected order creation endpoint
5. **Order Confirmation** → Order ID, status, and ETA display

**Order Creation Process:**
```typescript
const orderData = {
  customer: { name, phone, address, notes },
  items: cartItems.map(item => ({ id: item.id, qty: item.quantity }))
};

const result = await createOrder(orderData).unwrap();
// Returns: { orderId, status: "PENDING", etaMinutes: 30 }
```

### 4. Loading States & Error Handling ✅
**Comprehensive UX for all API states**

- **Loading Skeletons**: Animated placeholders during data fetching
- **Error Messages**: User-friendly error display with retry options
- **Network Errors**: Graceful handling of connection issues
- **Validation Errors**: Clear feedback for form validation failures

**Loading State Examples:**
- Menu loading: Skeleton cards with pulse animation
- Order submission: "Placing Order..." button state
- Error retry: "Try Again" buttons with error messages

### 5. State Management Integration ✅
**Redux Toolkit with RTK Query for complete state management**

- **Menu State**: Search terms, categories, loading states
- **Cart State**: Items, quantities, totals, sidebar visibility
- **API Cache**: Automatic caching and invalidation
- **Real-time Updates**: State synchronization across components

## API Endpoints Integration

### Menu Endpoints
| Endpoint | Method | Frontend Usage | Status |
|----------|---------|----------------|---------|
| `/api/menu` | GET | Menu data fetching with filters | ✅ Working |
| `/api/menu/:id` | GET | Individual item details | ✅ Ready |

### Order Endpoints
| Endpoint | Method | Frontend Usage | Status |
|----------|---------|----------------|---------|
| `/api/orders` | POST | Order creation (CSRF protected) | ✅ Working |
| `/api/orders/:id` | GET | Order status tracking | ✅ Ready |
| `/api/orders/:id/status` | PUT | Status updates (admin) | ✅ Ready |

### Security Endpoints
| Endpoint | Method | Frontend Usage | Status |
|----------|---------|----------------|---------|
| `/api/auth/csrf` | GET | CSRF token generation | ✅ Working |
| `/api/health` | GET | Server health check | ✅ Working |

## Data Flow Examples

### 1. Menu Data Loading
```typescript
// 1. Component mounts
useEffect(() => {
  csrfService.ensureCsrfToken();
}, []);

// 2. API query with filters
const queryParams = {
  ...(searchTerm && { q: searchTerm }),
  ...(selectedCategory !== "all" && { category: selectedCategory }),
};

// 3. RTK Query fetch
const { data: menuItems, isLoading, error } = useGetMenuItemsQuery(queryParams);

// 4. UI rendering
{isLoading ? <LoadingSkeleton /> : <MenuGrid items={menuItems} />}
```

### 2. Order Creation
```typescript
// 1. CSRF token preparation
await csrfService.ensureCsrfToken();

// 2. Order data preparation
const orderData = {
  customer: { name, phone, address, notes },
  items: cartItems.map(item => ({ id: item.id, qty: item.quantity }))
};

// 3. API call with automatic CSRF
const result = await createOrder(orderData).unwrap();

// 4. Success handling
setOrderSuccess(result);
dispatch(clearCart());
```

## Security Features

### 1. CSRF Protection
- **Token Lifespan**: 15 minutes with automatic refresh
- **Secure Storage**: HTTP-only cookies + localStorage
- **Validation**: Server-side HMAC signature verification
- **Error Recovery**: Automatic token refresh on expiry

### 2. Input Validation
- **Client-Side**: Form validation with TypeScript types
- **Server-Side**: DTO validation with class-validator
- **Sanitization**: XSS prevention and data cleaning

### 3. Error Handling
- **Network Errors**: Retry mechanisms and user feedback
- **Validation Errors**: Field-specific error messages
- **Security Errors**: Automatic token refresh and retry

## User Experience Features

### 1. Loading States
```css
/* Skeleton loading animation */
.loading-card {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
```

### 2. Error States
```tsx
{error && (
  <div className="error-message">
    <p>❌ {error}</p>
    <button onClick={() => refetch()}>Try Again</button>
  </div>
)}
```

### 3. Success States
```tsx
{orderSuccess && (
  <div className="order-success">
    <div className="success-icon">✅</div>
    <h3>Order Confirmed!</h3>
    <p>Order ID: {orderSuccess.orderId}</p>
    <p>ETA: {orderSuccess.etaMinutes} minutes</p>
  </div>
)}
```

## Performance Optimizations

### 1. API Caching
- **RTK Query**: Automatic request deduplication
- **Tag-based Invalidation**: Smart cache updates
- **Background Refetching**: Keep data fresh

### 2. State Management
- **Redux Toolkit**: Optimized state updates with Immer
- **Memoization**: Prevent unnecessary re-renders
- **Efficient Selectors**: Optimized state selection

### 3. Network Optimization
- **Request Batching**: Combine multiple operations
- **Error Recovery**: Exponential backoff for retries
- **Offline Handling**: Graceful degradation (future)

## Testing Integration

### 1. API Endpoints Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Menu data
curl http://localhost:3000/api/menu

# CSRF token
curl http://localhost:3000/api/auth/csrf
```

### 2. Frontend Integration Testing
```bash
# Start backend
cd apps/backend && pnpm run start:dev

# Start frontend  
cd apps/frontend && pnpm run dev

# Access application
open http://localhost:5173
```

### 3. End-to-End Flow Testing
1. **Visit Menu**: Load real menu data from backend
2. **Add Items**: Add items to cart with real-time updates
3. **Search/Filter**: Test API filtering with different parameters
4. **Checkout**: Complete order creation with CSRF protection
5. **Order Confirmation**: Verify order created in backend

## Environment Configuration

### Backend (.env)
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
DATA_FILE=./data/app.json
CSRF_SECRET=development-secret
```

### Frontend (Vite Config)
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

## Future Enhancements

### 1. Real-time Features
- **WebSocket Integration**: Live order status updates
- **Push Notifications**: Order status notifications
- **Live Menu Updates**: Real-time availability changes

### 2. Offline Capabilities
- **Service Worker**: Cache API responses
- **Background Sync**: Queue orders when offline
- **Cache Strategies**: Stale-while-revalidate for menu data

### 3. Advanced Features
- **Order History**: Customer order tracking
- **Favorites**: Save favorite menu items
- **Recommendations**: AI-powered menu suggestions

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom**: Network errors when calling API
**Solution**: Verify CORS_ORIGIN in backend .env matches frontend URL

#### 2. CSRF Token Issues
**Symptom**: 403 Forbidden on order creation
**Solution**: Check if CSRF service is properly initialized and tokens are being sent

#### 3. Menu Not Loading
**Symptom**: Empty menu or loading state stuck
**Solution**: Verify backend is running and menu endpoint returns data

#### 4. Build Errors
**Symptom**: TypeScript compilation errors
**Solution**: Ensure all type imports use `import type` syntax

### Development Commands
```bash
# Backend development
cd apps/backend && pnpm run start:dev

# Frontend development  
cd apps/frontend && pnpm run dev

# Backend build test
cd apps/backend && pnpm run build

# Frontend build test
cd apps/frontend && pnpm run build
```

## Conclusion

The frontend-backend integration is **fully operational** with:

✅ **Real API Integration**: Live menu data from NestJS backend  
✅ **Security**: CSRF protection for all mutations  
✅ **Order Management**: Complete order creation workflow  
✅ **UX Excellence**: Loading states, error handling, success feedback  
✅ **State Management**: Redux Toolkit with RTK Query  
✅ **Type Safety**: End-to-end TypeScript integration  

The application is ready for production deployment with a solid foundation for future enhancements like real-time features, offline capabilities, and advanced order management.

**Access Points:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api  
- **API Docs**: http://localhost:3000/docs

The integration provides a seamless, secure, and performant user experience for the Food Ordering PWA! 🚀
