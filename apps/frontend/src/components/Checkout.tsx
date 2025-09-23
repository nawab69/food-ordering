import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { useCreateOrderMutation } from '../store/api/apiSlice';
import { clearCart, setCartOpen } from '../store/slices/cartSlice';

interface CheckoutProps {
    onClose: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onClose }) => {
    const dispatch = useAppDispatch();
    const { items: cartItems, total } = useAppSelector((state) => state.cart);
    const [createOrder, { isLoading, error }] = useCreateOrderMutation();

    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        address: '',
        notes: '',
    });

    const [orderSuccess, setOrderSuccess] = useState<{
        orderId: string;
        status: string;
        etaMinutes: number;
    } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }

        if (!customerData.name || !customerData.phone) {
            alert('Please fill in required fields');
            return;
        }

        try {

            const orderData = {
                customer: customerData,
                items: cartItems.map(item => ({
                    id: item.id,
                    qty: item.quantity
                }))
            };

            const result = await createOrder(orderData).unwrap();

            setOrderSuccess(result);
            dispatch(clearCart());

        } catch (error: any) {
            console.error('Order creation failed:', error);

            alert('Failed to create order. Please try again.');
        }
    };

    const handleClose = () => {
        dispatch(setCartOpen(false));
        onClose();
    };

    if (orderSuccess) {
        return (
            <div className="checkout-container">
                <div className="checkout-header">
                    <h2>Order Confirmed! 🎉</h2>
                    <button className="close-button" onClick={handleClose}>
                        ✕
                    </button>
                </div>

                <div className="order-success">
                    <div className="success-icon">✅</div>
                    <h3>Thank you for your order!</h3>
                    <div className="order-details">
                        <p><strong>Order ID:</strong> {orderSuccess.orderId}</p>
                        <p><strong>Status:</strong> {orderSuccess.status}</p>
                        <p><strong>Estimated Time:</strong> {orderSuccess.etaMinutes} minutes</p>
                    </div>
                    <p className="success-message">
                        We'll start preparing your order right away. You'll receive updates on your order status.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button className="continue-button" onClick={handleClose}>
                            Continue Shopping
                        </button>
                        <button
                            className="cta-button primary"
                            onClick={() => {
                                handleClose();
                                window.location.href = `/order/${orderSuccess.orderId}`;
                            }}
                        >
                            Track Order
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h2>Checkout</h2>
                <button className="close-button" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="checkout-content">
                <div className="order-summary">
                    <h3>Order Summary</h3>
                    <div className="order-items">
                        {cartItems.map((item) => (
                            <div key={item.id} className="order-item">
                                <span className="item-emoji">{item.imageUrl}</span>
                                <div className="item-details">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-qty">Qty: {item.quantity}</span>
                                </div>
                                <span className="item-total">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="order-total">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Delivery:</span>
                            <span>$3.99</span>
                        </div>
                        <div className="total-row final">
                            <span>Total:</span>
                            <span>${(total + 3.99).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <form className="customer-form" onSubmit={handleSubmit}>
                    <h3>Delivery Information</h3>

                    <div className="form-group">
                        <label htmlFor="name">Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={customerData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={customerData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={customerData.address}
                            onChange={handleInputChange}
                            placeholder="Delivery address"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Special Instructions</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={customerData.notes}
                            onChange={handleInputChange}
                            placeholder="Any special requests..."
                            rows={3}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <p>❌ Failed to create order. Please try again.</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="place-order-button"
                        disabled={isLoading || cartItems.length === 0}
                    >
                        {isLoading ? 'Placing Order...' : `Place Order - $${(total + 3.99).toFixed(2)}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
