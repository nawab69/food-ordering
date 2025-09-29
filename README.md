# Offline Food Ordering PWA

> **A Progressive Web Application for food ordering with offline capabilities, push notifications, and modern UI/UX**

## 📋 Project Title and Summary

**Offline Food Ordering PWA** is a mobile-first Progressive Web Application that enables users to browse food menus, add items to cart, and place orders with full offline support. The app features real-time order tracking, push notifications for status updates, and a comprehensive admin dashboard for restaurant management.

The application is built with modern web technologies and follows PWA best practices to provide a native app-like experience across all devices.

## ✨ Key Features

### 🍕 **Core Functionality**
- **Dynamic Menu** - Browse food items with categories, search, and filtering
- **Shopping Cart** - Add/remove items with quantity management
- **Order Placement** - Complete checkout with customer information
- **Order Tracking** - Real-time status updates with visual timeline
- **Order History** - View past orders with detailed information

### 📱 **PWA Features**
- **Offline Support** - Full functionality without internet connection
- **App Installation** - Install as native app on mobile devices
- **Push Notifications** - Real-time order status updates
- **Background Sync** - Queue orders when offline, sync when online
- **Service Worker** - Cache-first strategy for optimal performance

### 🎨 **Modern UI/UX**
- **Responsive Design** - Works seamlessly on all screen sizes
- **Glassmorphism Effects** - Modern backdrop blur styling
- **Smooth Animations** - Professional transitions and interactions
- **Dark/Light Themes** - Adaptive color schemes
- **Touch Optimized** - Mobile-first interaction design

### 🔧 **Admin Features**
- **Order Management** - View and update order statuses
- **Statistics Dashboard** - Real-time order metrics
- **Status Updates** - Change order status with API integration
- **Filtering & Sorting** - Advanced order management tools

## 🛠 Technologies Used

### **Frontend Stack**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Redux Toolkit** - State management with RTK Query
- **Tailwind CSS** - Utility-first CSS framework
- **PWA Plugin** - Service worker and manifest generation

### **Backend Stack**
- **NestJS** - Scalable Node.js framework
- **TypeScript** - Type-safe server development
- **Swagger/OpenAPI** - API documentation
- **LowDB** - File-based JSON database
- **Web Push** - Push notification service
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### **PWA & Offline**
- **Service Worker** - Background processing and caching
- **IndexedDB** - Client-side data persistence
- **Workbox** - PWA toolkit for caching strategies
- **Web Push API** - Push notification delivery
- **Background Sync** - Offline queue management

### **Development Tools**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **pnpm** - Fast package manager
- **Docker** - Containerization (optional)

## 🚀 How to Run (Local Setup)

### **Prerequisites**
- Node.js 20+ 
- pnpm (recommended) or npm
- Git

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd food-ordering
```

### **2. Install Dependencies**
```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
pnpm -C apps/frontend install

# Install backend dependencies
pnpm -C apps/backend install
```

### **3. Backend Setup**
```bash
# Navigate to backend directory
cd apps/backend

# Copy environment variables
cp env.example .env

# Edit .env file with your configuration
# Required variables:
# PORT=3000
# VAPID_PUBLIC_KEY=<your-vapid-public-key>
# VAPID_PRIVATE_KEY=<your-vapid-private-key>
# VAPID_SUBJECT=mailto:your-email@example.com

# Start backend server
pnpm start:dev
```

### **4. Frontend Setup**
```bash
# Navigate to frontend directory
cd apps/frontend

# Start development server
pnpm dev

# Or build and preview
pnpm build
pnpm preview
```

### **5. Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/docs

### **6. PWA Testing**
- Open Chrome DevTools
- Go to Application tab
- Check Service Worker registration
- Test offline functionality
- Install PWA on mobile device

## 📡 API Overview

### **Base URL**
```
http://localhost:3000/api
```

### **Menu Endpoints**
```http
GET    /api/menu                    # Get all menu items
GET    /api/menu/:id               # Get specific menu item
```

### **Order Endpoints**
```http
POST   /api/orders                 # Create new order
GET    /api/orders/:id            # Get order by ID
PUT    /api/orders/:id/status     # Update order status
```

### **Push Notification Endpoints**
```http
POST   /api/push/subscribe        # Subscribe to push notifications
DELETE /api/push/subscribe        # Unsubscribe from push notifications
GET    /api/push/publicKey        # Get VAPID public key
```

### **Health Check**
```http
GET    /api/health                # API health status
```

### **Sample API Requests**

#### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St"
    },
    "items": [
      {"id": "pizza_001", "quantity": 2},
      {"id": "burger_001", "quantity": 1}
    ]
  }'
```

#### Update Order Status
```bash
curl -X PUT http://localhost:3000/api/orders/order_123/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PREPARING"}'
```

## 🔒 Security Features Implemented

### **Client-Side Security**
- **Input Sanitization** - XSS prevention with DOMPurify
- **Content Security Policy** - Restrict resource loading
- **HTTPS Enforcement** - Secure communication
- **Secure Storage** - IndexedDB with encryption

### **Server-Side Security**
- **Helmet.js** - Security headers middleware
- **Rate Limiting** - API request throttling
- **CORS Configuration** - Cross-origin request control
- **Input Validation** - DTO validation with class-validator
- **Error Handling** - Secure error responses

### **API Security**
- **Request Validation** - Schema validation for all endpoints
- **Error Sanitization** - Safe error messages
- **Rate Limiting** - 100 requests per minute per IP
- **CORS Protection** - Restricted origin access

### **PWA Security**
- **Service Worker Scope** - Limited service worker access
- **Secure Context** - HTTPS requirement for PWA features
- **Manifest Security** - Secure manifest configuration
- **Push Notification Security** - VAPID key authentication


## 👥 Roles of Group Members

### **Kibria - Backend & Infrastructure**
- **Backend Development** - NestJS API development
- **Service Worker Setup** - PWA service worker implementation
- **Push Notifications** - Web Push API integration
- **Database Design** - Data models and persistence
- **API Documentation** - Swagger/OpenAPI setup
- **Security Implementation** - Authentication and authorization

### **Rishad - Frontend & Integration**
- **API Integration** - Frontend-backend communication
- **Frontend Development** - React components and routing
- **Cart & Orders Persistence** - IndexedDB implementation
- **State Management** - Redux Toolkit setup
- **PWA Features** - Offline functionality and caching
- **Performance Optimization** - Code splitting and lazy loading

### **Miraz - Frontend UI Design**
- **UI/UX Design** - Modern, responsive interface design
- **Component Development** - Reusable React components
- **Styling & Theming** - CSS and design system
- **User Experience** - Intuitive navigation and interactions
- **Responsive Design** - Mobile-first approach
- **Visual Design** - Glassmorphism and modern aesthetics

## 📁 Project Structure

```
food-ordering/
├── apps/
│   ├── frontend/          # React PWA
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── services/      # API and persistence services
│   │   │   ├── store/         # Redux store and slices
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── sw.ts          # Service worker
│   │   ├── public/           # Static assets
│   │   └── package.json
│   └── backend/           # NestJS API
│       ├── src/
│       │   ├── menu/          # Menu module
│       │   ├── orders/        # Orders module
│       │   ├── push/          # Push notifications
│       │   └── health/        # Health checks
│       ├── data/              # JSON database
│       └── package.json
├── docs/                 # Documentation
├── package.json          # Root package.json
└── README.md
```

## 🚀 Deployment

### **Development**
```bash
# Start both frontend and backend
pnpm dev:frontend
pnpm dev:backend
```

### **Production Build**
```bash
# Build frontend
pnpm -C apps/frontend build

# Start backend
pnpm -C apps/backend start:prod
```
