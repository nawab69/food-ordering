# Frontend Redux Integration Documentation

## Overview
This document describes the Redux Toolkit integration with React for the Food Ordering PWA frontend. The setup includes state management for menu browsing, cart functionality, and API integration with the NestJS backend.

## Architecture

### Redux Store Structure
```
src/store/
├── index.ts              # Main store configuration
├── api/
│   └── apiSlice.ts      # RTK Query API slice
├── slices/
│   ├── cartSlice.ts     # Cart state management
│   └── menuSlice.ts     # Menu filtering and search state
└── hooks/
    └── index.ts         # Typed Redux hooks
```

### State Management Features

#### 1. Cart Management (`cartSlice.ts`)
- **Add to Cart**: Add menu items with quantity
- **Remove from Cart**: Remove items completely
- **Update Quantity**: Modify item quantities
- **Clear Cart**: Empty entire cart
- **Toggle Cart**: Show/hide cart sidebar
- **Auto-calculate**: Automatic total and item count calculation

**Actions:**
- `addToCart(item: MenuItem)`
- `removeFromCart(itemId: string)`
- `updateQuantity({id, quantity})`
- `clearCart()`
- `toggleCart()`
- `setCartOpen(boolean)`

#### 2. Menu State (`menuSlice.ts`)
- **Category Selection**: Filter items by category
- **Search**: Text-based item search
- **Filters**: Advanced filtering (price, tags, etc.)
- **Loading States**: UI loading indicators
- **Error Handling**: API error states

**Actions:**
- `setSelectedCategory(category: string)`
- `setSearchTerm(term: string)`
- `setFilters(filters: MenuFilters)`
- `clearFilters()`
- `setLoading(boolean)`
- `setError(string | null)`

#### 3. API Integration (`apiSlice.ts`)
RTK Query setup for backend communication with automatic caching and synchronization.

**Endpoints:**
- `getMenuItems(params?)`: Fetch menu with filters
- `getMenuItem(id)`: Get single menu item
- `createOrder(orderData)`: Submit new order
- `getOrder(id)`: Fetch order details
- `updateOrderStatus({id, status})`: Update order status
- `subscribeToPush(subscription)`: Register push notifications
- `unsubscribeFromPush()`: Remove push subscription
- `getCsrfToken()`: Get CSRF token for security
- `getHealth()`: Health check endpoint

## TypeScript Types

### Core Data Types
```typescript
interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  tags?: string[];
  imageUrl?: string;
  available: boolean;
  description?: string;
  rating?: number;
  time?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  customer: Customer;
  createdAt: string;
  updatedAt: string;
}
```

## Component Integration

### Menu Component (`src/components/Menu.tsx`)
- **Redux Integration**: Uses `useAppSelector` and `useAppDispatch` hooks
- **Real-time Updates**: Cart state updates reflect immediately in UI
- **Category Filtering**: Connected to menu state for dynamic filtering
- **Search Functionality**: Live search with Redux state management
- **Cart Management**: Full cart operations (add, remove, update quantities)

### Key Features:
1. **Responsive Design**: Mobile-first approach with desktop optimizations
2. **State Persistence**: Cart state maintained across page navigations
3. **Loading States**: UI feedback during API operations
4. **Error Handling**: User-friendly error messages
5. **Optimistic Updates**: Immediate UI updates with server sync

## CSS Styling

### Menu Page Styles (`src/components/Menu.css`)
- **Gradient Backgrounds**: Modern purple/orange gradient theme
- **Glass Morphism**: Backdrop blur effects for modern UI
- **Responsive Grid**: Adaptive layouts for different screen sizes
- **Smooth Animations**: Hover effects and transitions
- **Cart Sidebar**: Slide-in animation for cart display

### Landing Page Styles (`src/App.css`)
- **Hero Section**: Full-screen landing with animated elements
- **Feature Cards**: Interactive cards with hover effects
- **Stats Grid**: Responsive statistics display
- **CTA Buttons**: Gradient buttons with hover animations

## Setup Instructions

### 1. Dependencies Installed
```bash
pnpm add @reduxjs/toolkit react-redux react-router-dom axios @tanstack/react-query
```

### 2. Store Configuration
The Redux store is configured in `src/store/index.ts` with:
- RTK Query API slice
- Cart reducer
- Menu reducer
- TypeScript integration

### 3. Provider Setup
Redux Provider and Router are configured in `src/main.tsx`:
```typescript
<Provider store={store}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</Provider>
```

## API Integration Notes

### Backend Endpoint Configuration
- **Base URL**: `http://localhost:3000/api`
- **CSRF Protection**: Automatic token handling
- **Caching**: RTK Query automatic caching with tags
- **Error Handling**: Standardized error responses

### Future API Integration
The current implementation uses mock data for menu items. To integrate with the NestJS backend:

1. **Replace Mock Data**: Remove hardcoded menu items in Menu component
2. **Use RTK Query Hooks**: Replace static data with `useGetMenuItemsQuery()`
3. **Add Loading States**: Implement loading spinners and error handling
4. **Implement Filters**: Connect search and category filters to API params

## Security Features

### CSRF Protection
- Automatic CSRF token retrieval and storage
- Token included in all mutations (POST, PUT, DELETE)
- Cookie-based session management

### Input Validation
- Client-side validation for cart operations
- TypeScript type safety for all data structures
- Sanitized user inputs

## Performance Optimizations

### Redux Toolkit Features
- **Immer Integration**: Immutable state updates with mutable syntax
- **RTK Query Caching**: Automatic request deduplication and caching
- **Code Splitting**: Lazy loading support for large applications
- **DevTools Integration**: Redux DevTools for development debugging

### React Optimizations
- **Memo Components**: Prevent unnecessary re-renders
- **Typed Hooks**: Performance and type safety with custom hooks
- **Efficient Selectors**: Optimized state selection

## Development Workflow

### 1. Adding New Features
1. Define TypeScript types in `src/types/index.ts`
2. Add API endpoints to `apiSlice.ts`
3. Create or update Redux slices for state management
4. Implement UI components with Redux integration
5. Add CSS styles following the established design system

### 2. Testing Integration
- Unit tests for Redux slices
- Integration tests for API endpoints
- Component tests with Redux provider
- E2E tests for user workflows

## Next Steps

1. **Backend Integration**: Connect to real NestJS API endpoints
2. **Offline Support**: Implement service worker for offline functionality
3. **Push Notifications**: Complete web push integration
4. **Order Management**: Add order tracking and status updates
5. **Payment Integration**: Add checkout and payment processing
6. **PWA Features**: Add manifest and service worker for app-like experience

## Conclusion

The Redux Toolkit integration provides a robust foundation for state management in the Food Ordering PWA. The setup includes modern best practices, TypeScript integration, and a scalable architecture that supports the application's growth and feature expansion.
