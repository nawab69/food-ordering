import React from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useGetMenuItemsQuery } from "../store/api/apiSlice";
import {
    setSelectedCategory,
    setSearchTerm,
} from "../store/slices/menuSlice";
import {
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleCart,
} from "../store/slices/cartSlice";
import { MenuItem as MenuItemType } from "../types";
import "./Menu.css";

function Menu() {
    const dispatch = useAppDispatch();

    // Redux state
    const { selectedCategory, searchTerm } = useAppSelector((state) => state.menu);
    const { items: cartItems, total, itemCount, isOpen: showCart } = useAppSelector((state) => state.cart);

    // Mock menu data (will be replaced with API call)
    const categories = [
        { id: "all", name: "All Items", icon: "🍽️" },
        { id: "pizza", name: "Pizza", icon: "🍕" },
        { id: "burgers", name: "Burgers", icon: "🍔" },
        { id: "asian", name: "Asian", icon: "🍜" },
        { id: "desserts", name: "Desserts", icon: "🍰" },
        { id: "drinks", name: "Drinks", icon: "🥤" },
    ];

    // Mock menu items data (will be replaced with API call)
    const menuItems: MenuItemType[] = [
        // Pizza
        {
            id: "1",
            name: "Truffle Margherita",
            category: "pizza",
            price: 24,
            imageUrl: "🍕",
            rating: 4.9,
            time: "25-30",
            description: "Fresh mozzarella, truffle oil, basil",
            available: true,
        },
        {
            id: "2",
            name: "Pepperoni Supreme",
            category: "pizza",
            price: 22,
            imageUrl: "🍕",
            rating: 4.8,
            time: "20-25",
            description: "Pepperoni, cheese, oregano",
            available: true,
        },
        {
            id: "3",
            name: "Veggie Delight",
            category: "pizza",
            price: 20,
            imageUrl: "🍕",
            rating: 4.7,
            time: "25-30",
            description: "Bell peppers, mushrooms, olives",
            available: true,
            tags: ["veg"],
        },

        // Burgers
        {
            id: "4",
            name: "Wagyu Classic",
            category: "burgers",
            price: 32,
            imageUrl: "🍔",
            rating: 5.0,
            time: "15-20",
            description: "Premium wagyu beef, lettuce, tomato",
            available: true,
        },
        {
            id: "5",
            name: "Chicken Deluxe",
            category: "burgers",
            price: 18,
            imageUrl: "🍔",
            rating: 4.6,
            time: "12-15",
            description: "Grilled chicken, avocado, bacon",
            available: true,
        },
        {
            id: "6",
            name: "Veggie Burger",
            category: "burgers",
            price: 16,
            imageUrl: "🍔",
            rating: 4.5,
            time: "10-15",
            description: "Plant-based patty, fresh veggies",
            available: true,
            tags: ["veg"],
        },

        // Asian
        {
            id: "7",
            name: "Salmon Poke Bowl",
            category: "asian",
            price: 18,
            imageUrl: "🍣",
            rating: 4.8,
            time: "15-20",
            description: "Fresh salmon, rice, edamame",
            available: true,
        },
        {
            id: "8",
            name: "Pad Thai Special",
            category: "asian",
            price: 16,
            imageUrl: "🍜",
            rating: 4.7,
            time: "20-25",
            description: "Rice noodles, shrimp, peanuts",
            available: true,
        },
        {
            id: "9",
            name: "Chicken Ramen",
            category: "asian",
            price: 15,
            imageUrl: "🍜",
            rating: 4.6,
            time: "25-30",
            description: "Rich broth, tender chicken, egg",
            available: true,
        },

        // Desserts
        {
            id: "10",
            name: "Chocolate Lava Cake",
            category: "desserts",
            price: 12,
            imageUrl: "🍰",
            rating: 4.9,
            time: "10-15",
            description: "Warm chocolate cake, vanilla ice cream",
            available: true,
        },
        {
            id: "11",
            name: "Tiramisu",
            category: "desserts",
            price: 10,
            imageUrl: "🍰",
            rating: 4.8,
            time: "5-10",
            description: "Classic Italian dessert",
            available: true,
        },

        // Drinks
        {
            id: "12",
            name: "Fresh Mango Smoothie",
            category: "drinks",
            price: 8,
            imageUrl: "🥤",
            rating: 4.7,
            time: "5-10",
            description: "Fresh mango, yogurt, honey",
            available: true,
            tags: ["veg"],
        },
        {
            id: "13",
            name: "Iced Coffee",
            category: "drinks",
            price: 6,
            imageUrl: "☕",
            rating: 4.5,
            time: "3-5",
            description: "Cold brew, milk, caramel",
            available: true,
        },
    ];

    const filteredItems = menuItems.filter((item) => {
        const matchesCategory =
            selectedCategory === "all" || item.category === selectedCategory;
        const matchesSearch = item.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch && item.available;
    });

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
                        <span className="items-count">{filteredItems.length} items</span>
                    </div>

                    <div className="menu-grid">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="menu-item">
                                <div className="item-image">
                                    <span className="food-emoji">{item.imageUrl}</span>
                                    <div className="item-badge">⭐ {item.rating}</div>
                                </div>

                                <div className="item-content">
                                    <div className="item-header">
                                        <h3>{item.name}</h3>
                                        <span className="item-time">🕒 {item.time} min</span>
                                    </div>

                                    <p className="item-description">{item.description}</p>

                                    <div className="item-footer">
                                        <span className="item-price">${item.price}</span>
                                        <button
                                            className="add-button"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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

                                        <button className="checkout-button">
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
        </div>
    );
}

export default Menu;
