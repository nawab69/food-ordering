// Data models based on requirement.md

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
    estimatedTime?: string;
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

export interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    customer: Customer;
    createdAt: string;
    updatedAt: string;
    etaMinutes?: number;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    userHint?: string;
    orderIdHint?: string;
}

export interface DatabaseSchema {
    menuItems: MenuItem[];
    orders: Order[];
    pushSubscriptions: PushSubscription[];
}

export interface MenuFilters {
    q?: string;
    category?: string;
    veg?: boolean;
    minPrice?: number;
    maxPrice?: number;
}
