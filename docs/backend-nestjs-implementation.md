# Backend NestJS Implementation Documentation

## Overview
This document describes the complete NestJS backend implementation for the Food Ordering PWA. The backend provides secure API endpoints for menu management, order processing, push notifications, and authentication with CSRF protection.

## Architecture

### Project Structure
```
src/
├── common/
│   ├── dto/          # Data Transfer Objects with validation
│   └── types/        # TypeScript type definitions
├── database/
│   └── database.service.ts    # LowDB file-based storage
├── menu/
│   ├── menu.controller.ts     # Menu API endpoints
│   ├── menu.service.ts        # Menu business logic
│   └── menu.module.ts         # Menu module
├── orders/
│   ├── orders.controller.ts   # Order API endpoints
│   ├── orders.service.ts      # Order processing logic
│   └── orders.module.ts       # Orders module
├── push/
│   ├── push.controller.ts     # Push notification endpoints
│   ├── push.service.ts        # Web Push implementation
│   └── push.module.ts         # Push module
├── auth/
│   ├── auth.controller.ts     # CSRF token endpoints
│   ├── csrf.service.ts        # CSRF token generation/validation
│   ├── csrf.guard.ts          # CSRF protection guard
│   └── auth.module.ts         # Auth module
├── health/
│   ├── health.controller.ts   # Health check endpoints
│   └── health.module.ts       # Health module
├── app.module.ts              # Main application module
└── main.ts                    # Application bootstrap
```

## Core Features

### 1. Data Storage (LowDB)
**File:** `src/database/database.service.ts`

- **File-based JSON storage** using LowDB v7
- **Atomic writes** to prevent data corruption
- **Default data initialization** with sample menu items
- **CRUD operations** for menu items, orders, and push subscriptions

**Data Schema:**
```typescript
interface DatabaseSchema {
  menuItems: MenuItem[];
  orders: Order[];
  pushSubscriptions: PushSubscription[];
}
```

### 2. Menu Management
**Module:** `src/menu/`

**Features:**
- ✅ Get all menu items with filtering
- ✅ Get menu item by ID
- ✅ Create new menu items (admin)
- ✅ Update menu items (admin)
- ✅ Delete menu items (admin)

**Filtering Options:**
- Text search (`q` parameter)
- Category filtering (`category` parameter)
- Vegetarian filtering (`veg` parameter)
- Price range filtering (`minPrice`, `maxPrice`)

**Sample Menu Items:**
- Pizza: Truffle Margherita, Pepperoni Supreme, Veggie Delight
- Burgers: Wagyu Classic, Chicken Deluxe, Veggie Burger
- Asian: Salmon Poke Bowl, Pad Thai, Chicken Ramen
- Desserts: Chocolate Lava Cake, Tiramisu
- Drinks: Mango Smoothie, Iced Coffee

### 3. Order Processing
**Module:** `src/orders/`

**Features:**
- ✅ Create new orders with validation
- ✅ Get order by ID
- ✅ Update order status
- ✅ Automatic total calculation
- ✅ ETA estimation
- ✅ Status transition validation

**Order Status Flow:**
```
PENDING → ACCEPTED → PREPARING → READY → COMPLETED
    ↓         ↓          ↓
CANCELLED  CANCELLED  CANCELLED
```

**Order Validation:**
- Menu item existence check
- Availability verification
- Price calculation
- Customer data validation

### 4. Push Notifications
**Module:** `src/push/`

**Features:**
- ✅ VAPID key generation and management
- ✅ Push subscription management
- ✅ Order status notifications
- ✅ New order notifications (admin)
- ✅ Automatic invalid subscription cleanup

**Web Push Integration:**
- Uses `web-push` library for sending notifications
- Supports encryption with P256DH and Auth keys
- Handles subscription lifecycle

### 5. Security & Authentication
**Module:** `src/auth/`

**CSRF Protection:**
- ✅ Token generation with HMAC signatures
- ✅ Double-submit cookie pattern
- ✅ Time-based token expiration (15 minutes)
- ✅ Constant-time comparison for security

**Security Middleware:**
- ✅ Helmet for security headers
- ✅ CORS configuration
- ✅ Rate limiting with multiple tiers
- ✅ Input validation and sanitization

### 6. API Documentation
**Swagger Integration:**
- ✅ Complete OpenAPI documentation
- ✅ Interactive API explorer at `/docs`
- ✅ JSON schema export at `/docs-json`
- ✅ Authentication examples
- ✅ Request/response schemas

## API Endpoints

### Base URL: `http://localhost:3000/api`

### Menu Endpoints
```http
GET    /api/menu              # Get all menu items (with filters)
GET    /api/menu/:id          # Get menu item by ID
POST   /api/menu              # Create menu item (admin)
PUT    /api/menu/:id          # Update menu item (admin)
DELETE /api/menu/:id          # Delete menu item (admin)
```

### Order Endpoints
```http
POST   /api/orders            # Create new order (CSRF protected)
GET    /api/orders/:id        # Get order by ID
PUT    /api/orders/:id/status # Update order status (CSRF protected)
GET    /api/orders            # Get all orders (admin)
```

### Push Notification Endpoints
```http
POST   /api/push/subscribe    # Subscribe to push notifications (CSRF protected)
DELETE /api/push/subscribe    # Unsubscribe from push notifications (CSRF protected)
GET    /api/push/publicKey    # Get VAPID public key
```

### Authentication Endpoints
```http
GET    /api/auth/csrf         # Get CSRF token (sets cookie)
```

### Health Check
```http
GET    /api/health            # Health check endpoint
```

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATA_FILE=./data/app.json

# CORS
CORS_ORIGIN=http://localhost:5173

# Security
CSRF_SECRET=your-csrf-secret-change-in-production

# Web Push (VAPID Keys)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:dev@example.com

# Rate Limiting
RATE_LIMIT_POINTS=100
RATE_LIMIT_DURATION=60
```

### Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

## Security Features

### 1. CSRF Protection
- **Double-submit cookies**: Token must match between header and cookie
- **HMAC signatures**: Cryptographically signed tokens
- **Time-based expiry**: Tokens expire after 15 minutes
- **Constant-time comparison**: Prevents timing attacks

### 2. Rate Limiting
**Multiple tiers:**
- **Short**: 3 requests per second
- **Medium**: 20 requests per 10 seconds  
- **Long**: 100 requests per minute

### 3. Input Validation
- **Class-validator**: DTO validation with decorators
- **Whitelist**: Only allow known properties
- **Transform**: Automatic type conversion
- **Sanitization**: Remove potentially harmful data

### 4. Security Headers
- **Helmet**: Standard security headers
- **CSP**: Content Security Policy
- **CORS**: Configured for specific origins
- **Cookies**: HttpOnly, Secure, SameSite

## Data Models

### MenuItem
```typescript
interface MenuItem {
  id: string;
  name: string;
  price: number;        // Price in cents
  category: string;
  tags?: string[];
  imageUrl?: string;
  available: boolean;
  description?: string;
  rating?: number;
  estimatedTime?: string;
}
```

### Order
```typescript
interface Order {
  id: string;
  items: OrderItem[];
  total: number;        // Total in cents
  status: OrderStatus;
  customer: Customer;
  createdAt: string;
  updatedAt: string;
  etaMinutes?: number;
}
```

### Customer
```typescript
interface Customer {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}
```

## Error Handling

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **403**: Forbidden (CSRF errors)
- **404**: Not Found
- **429**: Too Many Requests (rate limit)
- **500**: Internal Server Error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Development Setup

### 1. Install Dependencies
```bash
cd apps/backend
pnpm install
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
# Add keys to .env file
```

### 4. Start Development Server
```bash
pnpm run start:dev
```

### 5. Access Documentation
- **API Docs**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/docs-json

## Testing

### Available Scripts
```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

### Test Strategy
- **Unit Tests**: Service and controller logic
- **Integration Tests**: Database operations
- **E2E Tests**: Complete API workflows
- **Security Tests**: CSRF and rate limiting

## Deployment Considerations

### Production Configuration
1. **Environment Variables**:
   - Set strong `CSRF_SECRET`
   - Configure production CORS origins
   - Set `NODE_ENV=production`

2. **Security**:
   - Use HTTPS in production
   - Secure cookie settings
   - Rate limiting configuration

3. **Database**:
   - Ensure data directory permissions
   - Regular backups of JSON file
   - Monitor disk space

4. **Monitoring**:
   - Health check endpoint
   - Application logs
   - Error tracking

## Performance Optimizations

### 1. Database Optimizations
- **In-memory caching** for frequently accessed data
- **Atomic writes** to prevent corruption
- **Efficient filtering** algorithms

### 2. API Optimizations
- **Rate limiting** to prevent abuse
- **Compression** for response bodies
- **Caching headers** for static content

### 3. Memory Management
- **Proper cleanup** of push subscriptions
- **Garbage collection** monitoring
- **Memory leak detection**

## Future Enhancements

### 1. Authentication
- User registration and login
- Role-based access control
- JWT token management

### 2. Database
- Migration to PostgreSQL/MySQL
- Database connection pooling
- Query optimization

### 3. Features
- Order history
- Payment integration
- Inventory management
- Analytics and reporting

### 4. DevOps
- Docker containerization
- CI/CD pipeline
- Load balancing
- Horizontal scaling

## Conclusion

The NestJS backend provides a robust, secure, and scalable foundation for the Food Ordering PWA. Key achievements:

✅ **Complete API Implementation**: All required endpoints with proper validation
✅ **Security First**: CSRF protection, rate limiting, input validation
✅ **Comprehensive Documentation**: Swagger docs with examples
✅ **Push Notifications**: Full Web Push API integration
✅ **Type Safety**: TypeScript throughout with proper DTOs
✅ **Testing Ready**: Structured for unit and integration tests
✅ **Production Ready**: Security headers, error handling, monitoring

The backend is designed to scale and can be easily extended with additional features as the application grows.
