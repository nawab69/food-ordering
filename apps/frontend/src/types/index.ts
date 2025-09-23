// API Data Types based on requirement.md

export interface MenuItem {
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

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface Customer {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
}

export interface OrderItem {
    id: string;
    qty: number;
}

export interface CreateOrderRequest {
    customer: Customer;
    items: OrderItem[];
}

export interface CreateOrderResponse {
    orderId: string;
    status: OrderStatus;
    etaMinutes: number;
}

export interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    customer: Customer;
    createdAt: string;
    updatedAt: string;
}

export type OrderStatus =
    | 'PENDING'
    | 'ACCEPTED'
    | 'PREPARING'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED';

export interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    userHint?: string;
    orderIdHint?: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

export interface MenuFilters {
    q?: string;
    category?: string;
    veg?: boolean;
    minPrice?: number;
    maxPrice?: number;
}
