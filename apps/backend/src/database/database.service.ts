import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { DatabaseSchema, MenuItem, Order, PushSubscription } from '../common/types';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private db: Low<DatabaseSchema>;
    private readonly logger = new Logger(DatabaseService.name);

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const dataFile = this.configService.get<string>('DATA_FILE', './data/app.json');
        const dataDir = path.dirname(dataFile);

        // Ensure data directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            this.logger.log(`Created data directory: ${dataDir}`);
        }

        // Initialize database
        const adapter = new JSONFile<DatabaseSchema>(dataFile);
        this.db = new Low<DatabaseSchema>(adapter, this.getDefaultData());

        await this.db.read();

        // Initialize with default data if empty
        if (!this.db.data) {
            this.db.data = this.getDefaultData();
            await this.db.write();
            this.logger.log('Initialized database with default data');
        }

        this.logger.log(`Database initialized: ${dataFile}`);
    }

    private getDefaultData(): DatabaseSchema {
        return {
            menuItems: this.getDefaultMenuItems(),
            orders: [],
            pushSubscriptions: [],
        };
    }

    private getDefaultMenuItems(): MenuItem[] {
        return [
            // Pizza
            {
                id: uuidv4(),
                name: 'Truffle Margherita',
                category: 'pizza',
                price: 2400, // Price in cents
                imageUrl: '🍕',
                rating: 4.9,
                estimatedTime: '25-30 min',
                description: 'Fresh mozzarella, truffle oil, basil',
                available: true,
                tags: ['signature', 'vegetarian'],
            },
            {
                id: uuidv4(),
                name: 'Pepperoni Supreme',
                category: 'pizza',
                price: 2200,
                imageUrl: '🍕',
                rating: 4.8,
                estimatedTime: '20-25 min',
                description: 'Pepperoni, cheese, oregano',
                available: true,
            },
            {
                id: uuidv4(),
                name: 'Veggie Delight',
                category: 'pizza',
                price: 2000,
                imageUrl: '🍕',
                rating: 4.7,
                estimatedTime: '25-30 min',
                description: 'Bell peppers, mushrooms, olives',
                available: true,
                tags: ['vegetarian', 'healthy'],
            },

            // Burgers
            {
                id: uuidv4(),
                name: 'Wagyu Classic',
                category: 'burgers',
                price: 3200,
                imageUrl: '🍔',
                rating: 5.0,
                estimatedTime: '15-20 min',
                description: 'Premium wagyu beef, lettuce, tomato',
                available: true,
                tags: ['premium', 'signature'],
            },
            {
                id: uuidv4(),
                name: 'Chicken Deluxe',
                category: 'burgers',
                price: 1800,
                imageUrl: '🍔',
                rating: 4.6,
                estimatedTime: '12-15 min',
                description: 'Grilled chicken, avocado, bacon',
                available: true,
            },
            {
                id: uuidv4(),
                name: 'Veggie Burger',
                category: 'burgers',
                price: 1600,
                imageUrl: '🍔',
                rating: 4.5,
                estimatedTime: '10-15 min',
                description: 'Plant-based patty, fresh veggies',
                available: true,
                tags: ['vegetarian', 'vegan', 'healthy'],
            },

            // Asian
            {
                id: uuidv4(),
                name: 'Salmon Poke Bowl',
                category: 'asian',
                price: 1800,
                imageUrl: '🍣',
                rating: 4.8,
                estimatedTime: '15-20 min',
                description: 'Fresh salmon, rice, edamame',
                available: true,
                tags: ['healthy', 'fresh'],
            },
            {
                id: uuidv4(),
                name: 'Pad Thai Special',
                category: 'asian',
                price: 1600,
                imageUrl: '🍜',
                rating: 4.7,
                estimatedTime: '20-25 min',
                description: 'Rice noodles, shrimp, peanuts',
                available: true,
            },
            {
                id: uuidv4(),
                name: 'Chicken Ramen',
                category: 'asian',
                price: 1500,
                imageUrl: '🍜',
                rating: 4.6,
                estimatedTime: '25-30 min',
                description: 'Rich broth, tender chicken, egg',
                available: true,
            },

            // Desserts
            {
                id: uuidv4(),
                name: 'Chocolate Lava Cake',
                category: 'desserts',
                price: 1200,
                imageUrl: '🍰',
                rating: 4.9,
                estimatedTime: '10-15 min',
                description: 'Warm chocolate cake, vanilla ice cream',
                available: true,
                tags: ['dessert', 'warm'],
            },
            {
                id: uuidv4(),
                name: 'Tiramisu',
                category: 'desserts',
                price: 1000,
                imageUrl: '🍰',
                rating: 4.8,
                estimatedTime: '5-10 min',
                description: 'Classic Italian dessert',
                available: true,
                tags: ['dessert', 'classic'],
            },

            // Drinks
            {
                id: uuidv4(),
                name: 'Fresh Mango Smoothie',
                category: 'drinks',
                price: 800,
                imageUrl: '🥤',
                rating: 4.7,
                estimatedTime: '5-10 min',
                description: 'Fresh mango, yogurt, honey',
                available: true,
                tags: ['fresh', 'healthy', 'vegetarian'],
            },
            {
                id: uuidv4(),
                name: 'Iced Coffee',
                category: 'drinks',
                price: 600,
                imageUrl: '☕',
                rating: 4.5,
                estimatedTime: '3-5 min',
                description: 'Cold brew, milk, caramel',
                available: true,
                tags: ['caffeine'],
            },
        ];
    }

    // Menu operations
    async getMenuItems(): Promise<MenuItem[]> {
        return this.db.data.menuItems.filter(item => item.available);
    }

    async getMenuItemById(id: string): Promise<MenuItem | undefined> {
        return this.db.data.menuItems.find(item => item.id === id);
    }

    async createMenuItem(item: MenuItem): Promise<MenuItem> {
        this.db.data.menuItems.push(item);
        await this.db.write();
        return item;
    }

    async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
        const index = this.db.data.menuItems.findIndex(item => item.id === id);
        if (index === -1) return null;

        this.db.data.menuItems[index] = { ...this.db.data.menuItems[index], ...updates };
        await this.db.write();
        return this.db.data.menuItems[index];
    }

    async deleteMenuItem(id: string): Promise<boolean> {
        const index = this.db.data.menuItems.findIndex(item => item.id === id);
        if (index === -1) return false;

        this.db.data.menuItems.splice(index, 1);
        await this.db.write();
        return true;
    }

    // Order operations
    async getOrders(): Promise<Order[]> {
        return this.db.data.orders;
    }

    async getOrderById(id: string): Promise<Order | undefined> {
        return this.db.data.orders.find(order => order.id === id);
    }

    async createOrder(order: Order): Promise<Order> {
        this.db.data.orders.push(order);
        await this.db.write();
        return order;
    }

    async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
        const index = this.db.data.orders.findIndex(order => order.id === id);
        if (index === -1) return null;

        this.db.data.orders[index] = {
            ...this.db.data.orders[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        await this.db.write();
        return this.db.data.orders[index];
    }

    // Push subscription operations
    async getPushSubscriptions(): Promise<PushSubscription[]> {
        return this.db.data.pushSubscriptions;
    }

    async createPushSubscription(subscription: PushSubscription): Promise<PushSubscription> {
        // Remove existing subscription with same endpoint
        this.db.data.pushSubscriptions = this.db.data.pushSubscriptions.filter(
            sub => sub.endpoint !== subscription.endpoint
        );

        this.db.data.pushSubscriptions.push(subscription);
        await this.db.write();
        return subscription;
    }

    async deletePushSubscription(endpoint: string): Promise<boolean> {
        const initialLength = this.db.data.pushSubscriptions.length;
        this.db.data.pushSubscriptions = this.db.data.pushSubscriptions.filter(
            sub => sub.endpoint !== endpoint
        );

        if (this.db.data.pushSubscriptions.length < initialLength) {
            await this.db.write();
            return true;
        }
        return false;
    }
}
