import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useGetMenuItemsQuery } from "../store/api/apiSlice";
import {
    setSelectedCategory,
    setSearchTerm,
    setLoading,
    setError,
} from "../store/slices/menuSlice";
import {
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleCart,
} from "../store/slices/cartSlice";
import type { MenuItem as MenuItemType } from "../types";
import Checkout from "./Checkout";
import PushToggle from "./PushToggle";
import "./Menu.css";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";

function Menu() {
    const dispatch = useAppDispatch();
    const [showCheckout, setShowCheckout] = useState(false);
    const navigate = useNavigate();

    // Redux state
    const { selectedCategory, searchTerm, isLoading, error } = useAppSelector((state) => state.menu);
    const { items: cartItems, total, itemCount, isOpen: showCart } = useAppSelector((state) => state.cart);

    // Prepare API query parameters
    const queryParams = {
        ...(searchTerm && { q: searchTerm }),
        ...(selectedCategory !== "all" && { category: selectedCategory }),
    };

    // API query for menu items
    const {
        data: menuItems = [],
        error: apiError,
        isLoading: apiLoading,
        refetch
    } = useGetMenuItemsQuery(queryParams);

    // Update loading state
    useEffect(() => {
        dispatch(setLoading(apiLoading));
    }, [apiLoading, dispatch]);

    // Update error state
    useEffect(() => {
        if (apiError) {
            dispatch(setError('Failed to load menu items'));
        } else {
            dispatch(setError(null));
        }
    }, [apiError, dispatch]);

    const categories = [
        { id: "all", name: "All Items", icon: "🍽️" },
        { id: "pizza", name: "Pizza", icon: "🍕" },
        { id: "burgers", name: "Burgers", icon: "🍔" },
        { id: "asian", name: "Asian", icon: "🍜" },
        { id: "desserts", name: "Desserts", icon: "🍰" },
        { id: "drinks", name: "Drinks", icon: "🥤" },
    ];

    // The API already handles filtering based on queryParams, so we use the data directly
    const filteredItems = menuItems || [];

    const handleAddToCart = (item: MenuItemType) => {
        dispatch(addToCart(item));
    };

    const handleRemoveFromCart = (itemId: string) => {
        dispatch(removeFromCart(itemId));
    };

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    };

    const getTotalPrice = () => {
        return total;
    };

    const getTotalItems = () => {
        return itemCount;
    };

    return (
        <div className="menu-page">
            {/* Header */}
            <header className="menu-header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">🍽️</div>
                        <span>Foodies Delight</span>
                    </div>

                    <div className="header-actions">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search delicious food..."
                                value={searchTerm}
                                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                            />
                        </div>

                        <button
                            className="cart-button"
                            onClick={() => dispatch(toggleCart())}
                        >
                            🛒
                            {getTotalItems() > 0 && (
                                <span className="cart-count">{getTotalItems()}</span>
                            )}
                        </button>
                        <PushToggle />
                        <button className="cta-button secondary" onClick={() => navigate('/settings')}>
                            Settings
                        </button>
                    </div>
                </div>
            </header>

            {/* Categories */}
            <section className="categories-section">
                <div className="categories-container">
                    <h2>What are you craving?</h2>
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`category-card ${selectedCategory === category.id ? "active" : ""
                                    }`}
                                onClick={() => dispatch(setSelectedCategory(category.id))}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-name">{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Menu Items */}
            <section className="menu-section">
                <div className="menu-container">
                    <div className="section-header">
                        <h2>
                            {selectedCategory === "all"
                                ? "All Items"
                                : categories.find((c) => c.id === selectedCategory)?.name}
                        </h2>
                        <span className="items-count">
                            {isLoading ? "Loading..." : `${filteredItems.length} items`}
                        </span>
                    </div>

                    {error && (
                        <div className="error-message">
                            <p>❌ {error}</p>
                            <button onClick={() => refetch()} className="retry-button">
                                Try Again
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="loading-grid">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="loading-card">
                                    <div className="loading-image"></div>
                                    <div className="loading-content">
                                        <div className="loading-title"></div>
                                        <div className="loading-description"></div>
                                        <div className="loading-footer"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="menu-grid">
                            {filteredItems.map((item: MenuItemType) => (
                                <div key={item.id} className="menu-item">
                                    <div className="item-image">
                                        <span className="food-emoji">{item.imageUrl}</span>
                                        <div className="item-badge">⭐ {item.rating}</div>
                                    </div>

                                    <div className="item-content">
                                        <div className="item-header">
                                            <h3>{item.name}</h3>
                                            <span className="item-time">🕒 {item.time}</span>
                                        </div>

                                        <p className="item-description">{item.description}</p>

                                        <div className="item-footer">
                                            <span className="item-price">${item.price}</span>
                                            <button
                                                className="add-button"
                                                onClick={() => handleAddToCart(item)}
                                                disabled={!item.available}
                                            >
                                                {item.available ? "Add to Cart" : "Unavailable"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Cart Sidebar */}
            {showCart && (
                <div className="cart-overlay" onClick={() => dispatch(toggleCart())}>
                    <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-header">
                            <h3>Your Order</h3>
                            <button className="close-cart" onClick={() => dispatch(toggleCart())}>
                                ✕
                            </button>
                        </div>

                        <div className="cart-content">
                            {cartItems.length === 0 ? (
                                <div className="empty-cart">
                                    <span className="empty-icon">🛒</span>
                                    <p>Your cart is empty</p>
                                    <span>Add some delicious items!</span>
                                </div>
                            ) : (
                                <>
                                    <div className="cart-items">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="cart-item">
                                                <div className="cart-item-image">{item.imageUrl}</div>
                                                <div className="cart-item-details">
                                                    <h4>{item.name}</h4>
                                                    <span className="cart-item-price">${item.price}</span>
                                                </div>
                                                <div className="quantity-controls">
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateQuantity(item.id, item.quantity - 1)
                                                        }
                                                    >
                                                        −
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateQuantity(item.id, item.quantity + 1)
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    className="remove-item"
                                                    onClick={() => handleRemoveFromCart(item.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="cart-summary">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>${getTotalPrice().toFixed(2)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Delivery</span>
                                            <span>$3.99</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Total</span>
                                            <span>${(getTotalPrice() + 3.99).toFixed(2)}</span>
                                        </div>

                                        <button
                                            className="checkout-button"
                                            onClick={() => setShowCheckout(true)}
                                        >
                                            Proceed to Checkout 🚀
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Cart Button (Mobile) */}
            {cartItems.length > 0 && !showCart && (
                <button className="floating-cart" onClick={() => dispatch(toggleCart())}>
                    <span>🛒 {getTotalItems()}</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                </button>
            )}

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="cart-overlay" onClick={() => setShowCheckout(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <Checkout onClose={() => setShowCheckout(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Menu;
