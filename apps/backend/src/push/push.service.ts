import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { PushSubscription as WebPushSubscription, OrderStatus } from '../common/types';
import { PushSubscriptionDto } from '../common/dto/push.dto';
import * as webpush from 'web-push';

@Injectable()
export class PushService {
    private readonly logger = new Logger(PushService.name);

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {
        this.initializeWebPush();
    }

    private initializeWebPush() {
        const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
        const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
        const subject = this.configService.get<string>('VAPID_SUBJECT', 'mailto:dev@example.com');

        if (publicKey && privateKey) {
            webpush.setVapidDetails(subject, publicKey, privateKey);
            this.logger.log('Web Push initialized with VAPID keys');
        } else {
            this.logger.warn('VAPID keys not configured. Push notifications will not work.');
        }
    }

    async subscribe(subscriptionDto: PushSubscriptionDto): Promise<{ success: boolean }> {
        try {
            const subscription: WebPushSubscription = {
                endpoint: subscriptionDto.endpoint,
                keys: {
                    p256dh: subscriptionDto.keys.p256dh,
                    auth: subscriptionDto.keys.auth,
                },
                userHint: subscriptionDto.userHint,
                orderIdHint: subscriptionDto.orderIdHint,
            };

            await this.databaseService.createPushSubscription(subscription);
            this.logger.log(`New push subscription registered: ${subscription.endpoint}`);

            return { success: true };
        } catch (error) {
            this.logger.error('Failed to save push subscription:', error);
            throw error;
        }
    }

    async unsubscribe(endpoint?: string): Promise<{ success: boolean }> {
        try {
            if (!endpoint) {
                // If no endpoint provided, we can't unsubscribe
                // In a real app, you might get this from authentication context
                return { success: false };
            }

            const deleted = await this.databaseService.deletePushSubscription(endpoint);

            if (deleted) {
                this.logger.log(`Push subscription removed: ${endpoint}`);
                return { success: true };
            }

            return { success: false };
        } catch (error) {
            this.logger.error('Failed to remove push subscription:', error);
            throw error;
        }
    }

    async getPublicKey(): Promise<string> {
        const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
        if (!publicKey) {
            throw new Error('VAPID public key not configured');
        }
        return publicKey;
    }

    async notifyOrderStatusUpdate(orderId: string, status: OrderStatus): Promise<void> {
        try {
            const subscriptions = await this.databaseService.getPushSubscriptions();

            // Filter subscriptions related to this order (if orderIdHint is set)
            const relevantSubscriptions = subscriptions.filter(sub =>
                !sub.orderIdHint || sub.orderIdHint === orderId
            );

            const payload = JSON.stringify({
                title: `Order #${orderId}`,
                body: `Your order is ${status.toLowerCase()}`,
                data: {
                    orderId,
                    status,
                    url: `/order/${orderId}`,
                },
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                actions: [
                    {
                        action: 'view',
                        title: 'View Order',
                    },
                ],
            });

            const notifications = relevantSubscriptions.map(subscription =>
                this.sendPushNotification(subscription, payload)
            );

            await Promise.allSettled(notifications);

            this.logger.log(`Sent ${notifications.length} push notifications for order ${orderId} status: ${status}`);
        } catch (error) {
            this.logger.error('Failed to send order status notifications:', error);
        }
    }

    async notifyNewOrder(orderId: string): Promise<void> {
        try {
            // This would typically notify restaurant staff/admin about new orders
            // For now, we'll just log it
            this.logger.log(`New order received: ${orderId}`);

            // In a real application, you might have separate subscriptions for admin notifications
            const subscriptions = await this.databaseService.getPushSubscriptions();
            const adminSubscriptions = subscriptions.filter(sub =>
                sub.userHint === 'admin' || sub.userHint === 'restaurant'
            );

            if (adminSubscriptions.length > 0) {
                const payload = JSON.stringify({
                    title: 'New Order Received',
                    body: `Order #${orderId} has been placed`,
                    data: {
                        orderId,
                        type: 'new_order',
                        url: `/admin/orders/${orderId}`,
                    },
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                });

                const notifications = adminSubscriptions.map(subscription =>
                    this.sendPushNotification(subscription, payload)
                );

                await Promise.allSettled(notifications);
                this.logger.log(`Notified ${notifications.length} admin subscriptions about new order`);
            }
        } catch (error) {
            this.logger.error('Failed to send new order notifications:', error);
        }
    }

    private async sendPushNotification(
        subscription: WebPushSubscription,
        payload: string
    ): Promise<void> {
        try {
            const webpushSubscription = {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
            };

            await webpush.sendNotification(webpushSubscription, payload);
        } catch (error: any) {
            this.logger.error(`Failed to send push notification to ${subscription.endpoint}:`, error);

            // Remove invalid subscriptions
            if (error.statusCode === 410 || error.statusCode === 404) {
                this.logger.log(`Removing invalid subscription: ${subscription.endpoint}`);
                await this.databaseService.deletePushSubscription(subscription.endpoint);
            }
        }
    }
}
