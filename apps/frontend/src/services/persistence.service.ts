import { openDB, deleteDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { CartItem, MenuItem } from '../types';

// Database schema
interface AppDB extends DBSchema {
    cart: {
        key: string;
        value: CartItem[];
    };
    orders: {
        key: string;
        value: {
            id: string;
            items: any[];
            total: number;
            status: string;
            customer: any;
            createdAt: string;
            updatedAt: string;
            etaMinutes?: number;
        };
    };
    menuItems: {
        key: string;
        value: MenuItem;
    };
}

class PersistenceService {
    private db: IDBPDatabase<AppDB> | null = null;

    async init() {
        if (this.db) return this.db;

        this.db = await openDB<AppDB>('food-ordering-app', 3, {
            upgrade(db, oldVersion) {
                console.log('Database upgrade from version', oldVersion, 'to version 3');

                // Delete and recreate cart store to remove keyPath
                if (db.objectStoreNames.contains('cart')) {
                    db.deleteObjectStore('cart');
                }
                db.createObjectStore('cart');

                // Orders store
                if (!db.objectStoreNames.contains('orders')) {
                    db.createObjectStore('orders', { keyPath: 'id' });
                }

                // Menu items cache
                if (!db.objectStoreNames.contains('menuItems')) {
                    db.createObjectStore('menuItems', { keyPath: 'id' });
                }
            },
        });

        return this.db;
    }

    // Cart persistence
    async saveCart(cartItems: CartItem[]) {
        console.log('Saving cart to IndexedDB:', cartItems);
        // Convert Redux Proxy to plain object for IndexedDB
        const plainCartItems = JSON.parse(JSON.stringify(cartItems));
        console.log('Converted to plain object:', plainCartItems);

        try {
            const db = await this.init();
            console.log('Database initialized, object stores:', db.objectStoreNames);
            const tx = db.transaction('cart', 'readwrite');
            console.log('Transaction created');
            await tx.store.put(plainCartItems, 'items');
            console.log('Data put to store');
            await tx.done;
            console.log('Transaction completed');
            console.log('Cart saved successfully');
        } catch (error) {
            console.error('Error saving cart:', error);
            throw error;
        }
    }

    async loadCart(): Promise<CartItem[]> {
        console.log('Loading cart from IndexedDB');
        const db = await this.init();
        const tx = db.transaction('cart', 'readonly');
        const cart = await tx.store.get('items');
        console.log('Loaded cart from IndexedDB:', cart);
        return cart || [];
    }

    async clearCart() {
        const db = await this.init();
        const tx = db.transaction('cart', 'readwrite');
        await tx.store.delete('items');
        await tx.done;
    }

    // Order persistence
    async saveOrder(order: any) {
        console.log('Saving order to IndexedDB:', order);
        // Convert to plain object for IndexedDB
        const plainOrder = JSON.parse(JSON.stringify(order));
        console.log('Converted order to plain object:', plainOrder);
        const db = await this.init();
        const tx = db.transaction('orders', 'readwrite');
        await tx.store.put(plainOrder);
        await tx.done;
        console.log('Order saved successfully');
    }

    async loadOrders(): Promise<any[]> {
        const db = await this.init();
        const tx = db.transaction('orders', 'readonly');
        const orders = await tx.store.getAll();
        return orders || [];
    }

    async getOrder(orderId: string): Promise<any | null> {
        const db = await this.init();
        const tx = db.transaction('orders', 'readonly');
        const order = await tx.store.get(orderId);
        return order || null;
    }

    async updateOrder(orderId: string, updates: any) {
        const db = await this.init();
        const tx = db.transaction('orders', 'readwrite');
        const order = await tx.store.get(orderId);
        if (order) {
            const updatedOrder = { ...order, ...updates, updatedAt: new Date().toISOString() };
            await tx.store.put(updatedOrder);
        }
        await tx.done;
    }

    // Menu items cache
    async cacheMenuItems(menuItems: MenuItem[]) {
        console.log('Caching menu items to IndexedDB:', menuItems.length, 'items');
        const db = await this.init();
        const tx = db.transaction('menuItems', 'readwrite');
        await tx.objectStore('menuItems').clear(); // Clear existing before adding new
        for (const item of menuItems) {
            await tx.store.put(item);
        }
        await tx.done;
        console.log('Menu items cached successfully');
    }

    async getCachedMenuItems(): Promise<MenuItem[]> {
        console.log('Loading cached menu items from IndexedDB');
        const db = await this.init();
        const tx = db.transaction('menuItems', 'readonly');
        const items = await tx.store.getAll();
        console.log('Loaded cached menu items:', items.length, 'items');
        return items || [];
    }

    async isMenuCached(): Promise<boolean> {
        const items = await this.getCachedMenuItems();
        return items.length > 0;
    }

    async clearMenuCache(): Promise<void> {
        console.log('Clearing menu cache');
        const db = await this.init();
        const tx = db.transaction('menuItems', 'readwrite');
        await tx.objectStore('menuItems').clear();
        await tx.done;
        console.log('Menu cache cleared');
    }

    // Clear all data
    async clearAllData() {
        const db = await this.init();
        const tx = db.transaction(['cart', 'orders', 'menuItems'], 'readwrite');
        await tx.objectStore('cart').clear();
        await tx.objectStore('orders').clear();
        await tx.objectStore('menuItems').clear();
        await tx.done;
    }

    async clearDatabase() {
        // Close existing connection
        if (this.db) {
            this.db.close();
            this.db = null;
        }

        // Delete the database
        await deleteDB('food-ordering-app');

        // Reinitialize
        await this.init();
    }

    async checkDatabaseStructure() {
        const db = await this.init();
        console.log('Database version:', db.version);
        console.log('Object stores:', Array.from(db.objectStoreNames));

        // Check cart store structure
        const cartStore = db.transaction('cart', 'readonly').objectStore('cart');
        console.log('Cart store keyPath:', cartStore.keyPath);
        console.log('Cart store autoIncrement:', cartStore.autoIncrement);
    }
}

export const persistenceService = new PersistenceService();
