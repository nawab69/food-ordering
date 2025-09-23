import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { persistenceService } from '../services/persistence.service';
import { useUpdateOrderStatusMutation } from '../store/api/apiSlice';
import './Admin.css';

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

const ORDER_STATUSES = [
    { value: 'PENDING', label: 'Pending', color: '#f59e0b', icon: '⏳' },
    { value: 'ACCEPTED', label: 'Accepted', color: '#3b82f6', icon: '✅' },
    { value: 'PREPARING', label: 'Preparing', color: '#8b5cf6', icon: '👨‍🍳' },
    { value: 'READY', label: 'Ready', color: '#10b981', icon: '🍽️' },
    { value: 'COMPLETED', label: 'Completed', color: '#059669', icon: '🎉' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#ef4444', icon: '❌' },
];

const Admin: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<'date' | 'status' | 'total'>('date');
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
    const navigate = useNavigate();

    // API mutation for updating order status
    const [updateOrderStatus] = useUpdateOrderStatusMutation();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const savedOrders = await persistenceService.loadOrders();
            console.log('Admin: Loaded orders from IndexedDB:', savedOrders);

            // Sort orders by selected criteria
            const sortedOrders = sortOrders(savedOrders, sortBy);
            setOrders(sortedOrders);
        } catch (err) {
            console.error('Failed to load orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const sortOrders = (orders: Order[], criteria: string) => {
        return [...orders].sort((a, b) => {
            switch (criteria) {
                case 'date':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'total':
                    return b.total - a.total;
                default:
                    return 0;
            }
        });
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            setUpdatingOrder(orderId);

            console.log(`Updating order ${orderId} status to ${newStatus}`);

            // Call API to update order status on backend
            const result = await updateOrderStatus({
                id: orderId,
                status: newStatus
            }).unwrap();

            console.log('API response:', result);

            // Update local state with the new status
            const updatedOrders = orders.map(order =>
                order.id === orderId
                    ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
                    : order
            );

            // Save updated orders back to IndexedDB
            for (const order of updatedOrders) {
                await persistenceService.saveOrder(order);
            }

            setOrders(updatedOrders);

            console.log(`Order ${orderId} status successfully updated to ${newStatus}`);

        } catch (err: any) {
            console.error('Failed to update order status:', err);

            // Handle different types of errors
            if (err?.data?.message) {
                setError(`API Error: ${err.data.message}`);
            } else if (err?.message) {
                setError(`Error: ${err.message}`);
            } else {
                setError('Failed to update order status. Please try again.');
            }

            // Clear error after 5 seconds
            setTimeout(() => setError(null), 5000);
        } finally {
            setUpdatingOrder(null);
        }
    };

    const getStatusInfo = (status: string) => {
        return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
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

    const getFilteredOrders = () => {
        if (filterStatus === 'ALL') return orders;
        return orders.filter(order => order.status === filterStatus);
    };

    const handleBackToMenu = () => {
        navigate('/');
    };

    const getOrderStats = () => {
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 'PENDING').length,
            preparing: orders.filter(o => o.status === 'PREPARING').length,
            ready: orders.filter(o => o.status === 'READY').length,
            completed: orders.filter(o => o.status === 'COMPLETED').length,
        };
        return stats;
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-header">
                    <button className="back-button" onClick={handleBackToMenu}>
                        ← Back to Menu
                    </button>
                    <h1>Admin Dashboard</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-page">
                <div className="admin-header">
                    <button className="back-button" onClick={handleBackToMenu}>
                        ← Back to Menu
                    </button>
                    <h1>Admin Dashboard</h1>
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

    const stats = getOrderStats();
    const filteredOrders = getFilteredOrders();

    return (
        <div className="admin-page">
            <div className="admin-header">
                <button className="back-button" onClick={handleBackToMenu}>
                    ← Back to Menu
                </button>
                <h1>Admin Dashboard</h1>
                <div className="admin-actions">
                    <button onClick={loadOrders} className="refresh-button">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-banner">
                    <div className="error-content">
                        <span className="error-icon">⚠️</span>
                        <span className="error-message">{error}</span>
                        <button
                            className="error-close"
                            onClick={() => setError(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card preparing">
                    <div className="stat-number">{stats.preparing}</div>
                    <div className="stat-label">Preparing</div>
                </div>
                <div className="stat-card ready">
                    <div className="stat-number">{stats.ready}</div>
                    <div className="stat-label">Ready</div>
                </div>
                <div className="stat-card completed">
                    <div className="stat-number">{stats.completed}</div>
                    <div className="stat-label">Completed</div>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="admin-controls">
                <div className="filter-group">
                    <label htmlFor="status-filter">Filter by Status:</label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">All Orders</option>
                        {ORDER_STATUSES.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.icon} {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="sort-group">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value as 'date' | 'status' | 'total');
                            const sorted = sortOrders(orders, e.target.value);
                            setOrders(sorted);
                        }}
                        className="sort-select"
                    >
                        <option value="date">Date (Newest First)</option>
                        <option value="status">Status</option>
                        <option value="total">Total Amount</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            <div className="admin-orders-container">
                {filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h2>No Orders Found</h2>
                        <p>No orders match the current filter criteria.</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                            <div key={order.id} className="admin-order-card">
                                <div className="order-header">
                                    <div className="order-id">#{order.id.slice(-8)}</div>
                                    <div className="order-date">{formatDate(order.createdAt)}</div>
                                </div>

                                <div className="order-content">
                                    <div className="order-info">
                                        <div className="customer-info">
                                            <h3>{order.customer.name}</h3>
                                            <p>{order.customer.phone}</p>
                                            {order.customer.address && (
                                                <p className="address">{order.customer.address}</p>
                                            )}
                                        </div>

                                        <div className="order-items">
                                            <h4>Items ({order.items.length})</h4>
                                            <div className="items-list">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="item-row">
                                                        <span className="item-quantity">{item.quantity}x</span>
                                                        <span className="item-name">{item.name}</span>
                                                        <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="order-total">
                                            <strong>Total: ${order.total.toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    <div className="order-actions">
                                        <div className="current-status">
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: statusInfo.color }}
                                            >
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </div>

                                        <div className="status-update">
                                            <label htmlFor={`status-${order.id}`}>Update Status:</label>
                                            <select
                                                id={`status-${order.id}`}
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                disabled={updatingOrder === order.id}
                                                className="status-select"
                                            >
                                                {ORDER_STATUSES.map(status => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.icon} {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {updatingOrder === order.id && (
                                                <div className="updating-indicator">Updating...</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {order.customer.notes && (
                                    <div className="order-notes">
                                        <strong>Notes:</strong> {order.customer.notes}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Admin;
