import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MenuService } from '../menu/menu.service';
import { Order, OrderStatus } from '../common/types';
import { CreateOrderDto, CreateOrderResponseDto } from '../common/dto/order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly menuService: MenuService,
    ) { }

    async createOrder(createOrderDto: CreateOrderDto): Promise<CreateOrderResponseDto> {
        // Validate menu items and calculate total
        let total = 0;

        for (const orderItem of createOrderDto.items) {
            const menuItem = await this.menuService.getMenuItemById(orderItem.id);
            if (!menuItem) {
                throw new HttpException(
                    `Menu item with ID ${orderItem.id} not found`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (!menuItem.available) {
                throw new HttpException(
                    `Menu item ${menuItem.name} is not available`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            total += menuItem.price * orderItem.qty;
        }

        // Generate order ID and timestamps
        const orderId = this.generateOrderId();
        const now = new Date().toISOString();

        // Calculate ETA based on order complexity
        const etaMinutes = this.calculateEta(createOrderDto.items.length);

        const order: Order = {
            id: orderId,
            items: createOrderDto.items,
            total,
            status: OrderStatus.PENDING,
            customer: createOrderDto.customer,
            createdAt: now,
            updatedAt: now,
            etaMinutes,
        };

        await this.databaseService.createOrder(order);

        return {
            orderId,
            status: OrderStatus.PENDING,
            etaMinutes,
        };
    }

    async getOrderById(id: string): Promise<Order | null> {
        const order = await this.databaseService.getOrderById(id);
        return order || null;
    }

    async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
        const order = await this.databaseService.getOrderById(id);
        if (!order) {
            return null;
        }

        // Validate status transition
        if (!this.isValidStatusTransition(order.status, status)) {
            throw new HttpException(
                `Invalid status transition from ${order.status} to ${status}`,
                HttpStatus.BAD_REQUEST,
            );
        }

        const updatedOrder = await this.databaseService.updateOrder(id, { status });

        // Here you would trigger push notifications to the user
        // This will be implemented in the push service

        return updatedOrder;
    }

    async getOrders(): Promise<Order[]> {
        return this.databaseService.getOrders();
    }

    private generateOrderId(): string {
        return `o_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private calculateEta(itemCount: number): number {
        // Simple ETA calculation based on item count
        const baseTime = 15; // Base preparation time in minutes
        const timePerItem = 5; // Additional minutes per item

        return Math.min(baseTime + (itemCount * timePerItem), 60); // Max 60 minutes
    }

    private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
            [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
            [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
            [OrderStatus.READY]: [OrderStatus.COMPLETED],
            [OrderStatus.COMPLETED]: [], // No transitions from completed
            [OrderStatus.CANCELLED]: [], // No transitions from cancelled
        };

        return validTransitions[currentStatus].includes(newStatus);
    }
}
