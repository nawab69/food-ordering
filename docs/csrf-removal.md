# CSRF Protection Removal

## Overview

CSRF (Cross-Site Request Forgery) protection has been completely removed from both the frontend and backend to simplify the development API. This change allows for easier testing and integration without requiring token management.

## Changes Made

### Backend Changes

#### 1. Removed Auth Module
- Deleted entire `src/auth/` directory and all related files:
  - `csrf.service.ts` - CSRF token generation and validation
  - `csrf.guard.ts` - NestJS guard for CSRF protection  
  - `auth.controller.ts` - Controller for CSRF token endpoints
  - `auth.module.ts` - Auth module configuration

#### 2. Updated Controllers
- **Orders Controller**: Removed `@UseGuards(CsrfGuard)` and `@ApiSecurity('csrf-token')` decorators
- **Push Controller**: Removed CSRF guard requirements from subscribe/unsubscribe endpoints
- **Removed CSRF-related error responses** from API documentation

#### 3. Updated Main Application
- **CORS Configuration**: Changed to allow all origins (`origin: true`)
- **Removed cookie-parser**: No longer needed for CSRF tokens
- **Updated Swagger Documentation**: Removed CSRF-related security definitions

#### 4. Environment Configuration
- Updated `env.example` to set `CORS_ORIGIN=*` for all origins
- Removed `CSRF_SECRET` environment variable

### Frontend Changes

#### 1. Removed CSRF Service
- Deleted `src/services/csrf.service.ts` and entire services directory
- Removed CSRF token fetching, storage, and validation logic

#### 2. Updated API Integration
- **API Slice**: Removed CSRF token headers and `prepareHeaders` logic
- **Removed Auth endpoints**: Deleted `getCsrfToken` query and related hooks
- **Simplified baseQuery**: No longer includes CSRF token management

#### 3. Updated Components
- **Menu Component**: Removed CSRF service import and token initialization
- **Checkout Component**: Removed CSRF token handling in order submission
- **Simplified error handling**: No longer handles CSRF token expiry scenarios

## API Changes

### Removed Endpoints
- `GET /api/auth/csrf` - CSRF token endpoint no longer exists

### Updated Endpoints
All POST/PUT/DELETE endpoints now work without CSRF tokens:
- `POST /api/orders` - Create order (no CSRF required)
- `PUT /api/orders/:id/status` - Update status (no CSRF required)
- `POST /api/push/subscribe` - Subscribe to push (no CSRF required)
- `DELETE /api/push/subscribe` - Unsubscribe (no CSRF required)

## Testing

### Successful Tests
- ✅ Backend builds without errors
- ✅ Frontend builds without TypeScript errors  
- ✅ API endpoints accessible without CSRF tokens
- ✅ Order creation works with simple JSON requests
- ✅ CORS allows requests from any origin
- ✅ Swagger documentation updated and accessible

### Example Usage
```bash
# Create order without CSRF
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  --data '{
    "customer": {"name": "Test User", "phone": "+1234567890"},
    "items": [{"id":"menu-item-id","qty":1}]
  }'
```

## Development Benefits

1. **Simplified Testing**: No need to manage CSRF tokens in API tests
2. **Easier Integration**: Third-party tools can access API without token setup
3. **Reduced Complexity**: Fewer error scenarios to handle in frontend
4. **Faster Development**: No token initialization delays

## Security Considerations

⚠️ **Note**: This configuration is intended for development only. In production environments, proper CSRF protection should be implemented to prevent cross-site request forgery attacks.

## Files Modified

### Backend
- `src/app.module.ts` - Removed AuthModule import
- `src/main.ts` - Updated CORS and removed cookie-parser
- `src/orders/orders.controller.ts` - Removed CSRF guards
- `src/orders/orders.module.ts` - Removed AuthModule dependency
- `src/push/push.controller.ts` - Removed CSRF guards  
- `src/push/push.module.ts` - Removed AuthModule dependency
- `env.example` - Updated CORS and removed CSRF secret

### Frontend
- `src/store/api/apiSlice.ts` - Removed CSRF handling
- `src/components/Menu.tsx` - Removed CSRF service usage
- `src/components/Checkout.tsx` - Simplified error handling
- `src/App.tsx` - Fixed TypeScript warnings

## Status
✅ **Complete** - All CSRF protection has been successfully removed from both frontend and backend. The application is now operating in a simplified development mode with open CORS and no CSRF requirements.
