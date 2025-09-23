import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { persistenceService } from '../services/persistence.service';
import './OrdersList.css';

interface Order {
    id: string;
    items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    total: number;
    status: string;
    customer: {
        name: string;
        phone: string;
        address?: string;
        notes?: string;
    };
    createdAt: string;
    updatedAt: string;
    etaMinutes?: number;
}

const OrdersList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const savedOrders = await persistenceService.loadOrders();
            console.log('Loaded orders from IndexedDB:', savedOrders);

            // Sort orders by creation date (newest first)
            const sortedOrders = savedOrders.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setOrders(sortedOrders);
        } catch (err) {
            console.error('Failed to load orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#f59e0b';
            case 'accepted':
                return '#3b82f6';
            case 'preparing':
                return '#8b5cf6';
            case 'ready':
                return '#10b981';
            case 'completed':
                return '#059669';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '⏳';
            case 'accepted':
                return '✅';
            case 'preparing':
                return '👨‍🍳';
            case 'ready':
                return '🍽️';
            case 'completed':
                return '🎉';
            case 'cancelled':
                return '❌';
            default:
                return '📋';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleOrderClick = (orderId: string) => {
        navigate(`/order/${orderId}`);
    };

    const handleBackToMenu = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="orders-list-page">
                <div className="orders-header">
                    <button className="back-button" onClick={handleBackToMenu}>
                        ← Back to Menu
                    </button>
                    <h1>Order History</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-list-page">
                <div className="orders-header">
                    <button className="back-button" onClick={handleBackToMenu}>
                        ← Back to Menu
                    </button>
                    <h1>Order History</h1>
                </div>
                <div className="error-container">
                    <p>❌ {error}</p>
                    <button onClick={loadOrders} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-list-page">
            <div className="orders-header">
                <button className="back-button" onClick={handleBackToMenu}>
                    ← Back to Menu
                </button>
                <h1>Order History</h1>
                <div className="orders-count">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h2>No Orders Yet</h2>
                    <p>Your order history will appear here once you place your first order.</p>
                    <button onClick={handleBackToMenu} className="cta-button">
                        Start Ordering
                    </button>
                </div>
            ) : (
                <div className="orders-container">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="order-card"
                            onClick={() => handleOrderClick(order.id)}
                        >
                            <div className="order-header">
                                <div className="order-id">#{order.id.slice(-8)}</div>
                                <div className="order-date">{formatDate(order.createdAt)}</div>
                            </div>

                            <div className="order-status">
                                <span
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                    {getStatusIcon(order.status)} {order.status}
                                </span>
                            </div>

                            <div className="order-items">
                                <div className="items-preview">
                                    {order.items.slice(0, 2).map((item, index) => (
                                        <div key={index} className="item-preview">
                                            <span className="item-quantity">{item.quantity}x</span>
                                            <span className="item-name">{item.name}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <div className="more-items">
                                            +{order.items.length - 2} more items
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="order-footer">
                                <div className="order-total">
                                    <span className="total-label">Total:</span>
                                    <span className="total-amount">${order.total.toFixed(2)}</span>
                                </div>
                                <div className="order-customer">
                                    <span className="customer-name">{order.customer.name}</span>
                                </div>
                            </div>

                            {order.etaMinutes && (
                                <div className="order-eta">
                                    <span className="eta-icon">⏱️</span>
                                    <span className="eta-text">
                                        ETA: {order.etaMinutes} minutes
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersList;
