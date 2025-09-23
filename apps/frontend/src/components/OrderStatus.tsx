import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderQuery, useGetMenuItemsQuery } from '../store/api/apiSlice';
import './OrderStatus.css';

const OrderStatus: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const {
        data: order,
        error,
        isLoading,
        refetch
    } = useGetOrderQuery(orderId!, {
        pollingInterval: 5000, // Poll every 5 seconds
    });

    // Fetch menu items to get names for order items
    const { data: menuItems = [] } = useGetMenuItemsQuery({});

    const statusTimeline = [
        { status: 'PENDING', label: 'Order Placed', description: 'Your order has been received' },
        { status: 'ACCEPTED', label: 'Order Accepted', description: 'Restaurant confirmed your order' },
        { status: 'PREPARING', label: 'Preparing', description: 'Your food is being prepared' },
        { status: 'READY', label: 'Ready for Pickup', description: 'Your order is ready' },
        { status: 'COMPLETED', label: 'Completed', description: 'Order delivered successfully' },
        { status: 'CANCELLED', label: 'Cancelled', description: 'Order was cancelled' },
    ];

    const getStatusIndex = (status: string) => {
        return statusTimeline.findIndex(item => item.status === status);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#f59e0b';
            case 'ACCEPTED': return '#3b82f6';
            case 'PREPARING': return '#8b5cf6';
            case 'READY': return '#10b981';
            case 'COMPLETED': return '#059669';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const getEstimatedTime = () => {
        if (!order?.etaMinutes) return null;
        const now = new Date();
        const estimated = new Date(now.getTime() + order.etaMinutes * 60000);
        return estimated.toLocaleTimeString();
    };

    // Helper function to get item name by ID
    const getItemName = (itemId: string) => {
        const menuItem = menuItems.find((item: any) => item.id === itemId);
        return menuItem ? menuItem.name : itemId;
    };

    if (isLoading) {
        return (
            <div className="order-status-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <h2>Loading order status...</h2>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-status-page">
                <div className="error-container">
                    <h2>Order not found</h2>
                    <p>We couldn't find order {orderId}</p>
                    <button
                        className="cta-button primary"
                        onClick={() => navigate('/menu')}
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-status-page">
            <div className="order-header">
                <button
                    className="back-button"
                    onClick={() => navigate('/menu')}
                >
                    ← Back to Menu
                </button>
                <h1>Order #{order.id}</h1>
                <div className="order-meta">
                    <span>Placed: {formatTime(order.createdAt)}</span>
                    {order.etaMinutes && (
                        <span>ETA: {getEstimatedTime()}</span>
                    )}
                </div>
            </div>

            <div className="status-timeline">
                <h2>Order Status</h2>
                <div className="timeline-container">
                    {statusTimeline.map((item, index) => {
                        const isActive = order.status === item.status;
                        const isCompleted = getStatusIndex(order.status) > index;

                        return (
                            <div key={item.status} className="timeline-item">
                                <div
                                    className="timeline-dot"
                                    style={{
                                        backgroundColor: isActive || isCompleted ? getStatusColor(item.status) : '#e5e7eb',
                                        borderColor: isActive ? getStatusColor(item.status) : '#e5e7eb',
                                    }}
                                >
                                    {isCompleted && <span>✓</span>}
                                </div>
                                <div className="timeline-content">
                                    <h3
                                        style={{
                                            color: isActive ? getStatusColor(item.status) : isCompleted ? '#059669' : '#6b7280'
                                        }}
                                    >
                                        {item.label}
                                    </h3>
                                    <p>{item.description}</p>
                                    {isActive && (
                                        <div className="status-badge" style={{ backgroundColor: getStatusColor(item.status) }}>
                                            Current Status
                                        </div>
                                    )}
                                </div>
                                {index < statusTimeline.length - 1 && (
                                    <div
                                        className="timeline-line"
                                        style={{
                                            backgroundColor: isCompleted ? '#059669' : '#e5e7eb'
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="order-details">
                <h2>Order Details</h2>
                <div className="order-items">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="order-item">
                            <span className="item-name">{getItemName(item.id)}</span>
                            <span className="item-qty">Qty: {item.qty}</span>
                        </div>
                    ))}
                </div>
                <div className="order-total">
                    <strong>Total: ${(order.total / 100).toFixed(2)}</strong>
                </div>
            </div>

            <div className="customer-info">
                <h2>Customer Information</h2>
                <div className="customer-details">
                    <p><strong>Name:</strong> {order.customer.name}</p>
                    <p><strong>Phone:</strong> {order.customer.phone}</p>
                    {order.customer.address && (
                        <p><strong>Address:</strong> {order.customer.address}</p>
                    )}
                    {order.customer.notes && (
                        <p><strong>Notes:</strong> {order.customer.notes}</p>
                    )}
                </div>
            </div>

            <div className="order-actions">
                <button
                    className="cta-button secondary"
                    onClick={() => refetch()}
                >
                    Refresh Status
                </button>
                <button
                    className="cta-button primary"
                    onClick={() => navigate('/menu')}
                >
                    Order More
                </button>
            </div>
        </div>
    );
};

export default OrderStatus;
