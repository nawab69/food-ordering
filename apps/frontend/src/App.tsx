import "./App.css";
import { useNavigate, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Menu from "./components/Menu";
import Settings from "./components/Settings";
import OrderStatus from "./components/OrderStatus";
import OrdersList from "./components/OrdersList";
import Admin from "./components/Admin";
import { useAppDispatch } from "./hooks";
import { loadCart } from "./store/slices/cartSlice";
import { persistenceService } from "./services/persistence.service";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again later.</h1>;
    }

    return this.props.children;
  }
}

function App() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Load cart from IndexedDB on app start
  useEffect(() => {
    const loadCartFromStorage = async () => {
      console.log('App: Loading cart from IndexedDB on app start');
      try {
        // Check database structure first
        await persistenceService.checkDatabaseStructure();

        const savedCart = await persistenceService.loadCart();
        console.log('App: Loaded cart from storage:', savedCart);
        if (savedCart.length > 0) {
          console.log('App: Dispatching loadCart with', savedCart.length, 'items');
          dispatch(loadCart(savedCart));
        }
      } catch (error) {
        console.error('Failed to load cart from storage:', error);
      }
    };

    loadCartFromStorage();
  }, [dispatch]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="landing-page">
            {/* Animated Background Elements */}
            <div className="background-elements">
              <div className="bg-circle bg-circle-1"></div>
              <div className="bg-circle bg-circle-2"></div>
            </div>

            <header className="hero-section">
              <div className="hero-content">
                {/* App Logo/Icon */}
                <div className="app-logo">
                  <div className="logo-icon">
                    <span>🍽️</span>
                    <div className="status-dot"></div>
                  </div>
                </div>

                <h1>
                  Foodies
                  <br />
                  <span className="gradient-text">Delight</span>
                </h1>

                <p>
                  Indulge in extraordinary flavors delivered to your doorstep in
                  <span className="highlight"> 30 minutes or less</span>
                </p>

                {/* CTA Buttons */}
                <div className="cta-buttons">
                  <button className="cta-button primary">📱 Order Now</button>
                  <button
                    className="cta-button secondary"
                    onClick={() => navigate("/menu")}
                  >
                    View Menu
                  </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">50K+</div>
                    <div className="stat-label">Happy Customers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">500+</div>
                    <div className="stat-label">Restaurant Partners</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">4.9 ⭐</div>
                    <div className="stat-label">Average Rating</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">25min ⏱️</div>
                    <div className="stat-label">Avg Delivery</div>
                  </div>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="scroll-indicator">
                <div className="scroll-mouse">
                  <div className="scroll-wheel"></div>
                </div>
              </div>
            </header>

            {/* Featured Food Preview */}
            <section className="featured-food">
              <div className="container">
                <h2>Today's Specials</h2>

                <div className="food-grid">
                  <div className="food-card">
                    <div className="food-emoji">🍕</div>
                    <h3>Truffle Pizza</h3>
                    <div className="food-details">
                      <span className="price">$24</span>
                      <span className="rating">⭐ 4.9</span>
                    </div>
                  </div>
                  <div className="food-card">
                    <div className="food-emoji">🍣</div>
                    <h3>Salmon Bowl</h3>
                    <div className="food-details">
                      <span className="price">$18</span>
                      <span className="rating">⭐ 4.8</span>
                    </div>
                  </div>
                  <div className="food-card">
                    <div className="food-emoji">🍔</div>
                    <h3>Wagyu Burger</h3>
                    <div className="food-details">
                      <span className="price">$32</span>
                      <span className="rating">⭐ 5.0</span>
                    </div>
                  </div>
                  <div className="food-card">
                    <div className="food-emoji">🍜</div>
                    <h3>Pad Thai</h3>
                    <div className="food-details">
                      <span className="price">$16</span>
                      <span className="rating">⭐ 4.7</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="features">
              <div className="container">
                <h2>Why Choose Us?</h2>

                <div className="features-grid">
                  <div className="feature">
                    <div className="feature-icon feature-icon-1">👨‍🍳</div>
                    <h2>Gourmet Cuisine</h2>
                    <p>
                      Curated dishes from top-rated restaurants and local
                      favorites
                    </p>
                  </div>

                  <div className="feature">
                    <div className="feature-icon feature-icon-2">🚚</div>
                    <h2>Lightning Fast</h2>
                    <p>
                      Average delivery time under 30 minutes with real-time
                      tracking
                    </p>
                  </div>

                  <div className="feature">
                    <div className="feature-icon feature-icon-3">🛡️</div>
                    <h2>Secure & Simple</h2>
                    <p>
                      Bank-grade security with one-tap payments and saved
                      preferences
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Download App CTA */}
            <section className="download-cta">
              <div className="container">
                <div className="cta-card">
                  <div className="cta-heart">❤️</div>

                  <h2>Ready to taste the difference?</h2>
                  <p>
                    Join thousands of food lovers and get your first order
                    delivered free!
                  </p>

                  <div className="cta-buttons">
                    <button className="cta-button primary">Download App</button>
                    <button className="cta-button secondary">
                      Order Online
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <footer className="footer">
              <div className="footer-content">
                <div className="footer-logo">
                  <div className="footer-icon">🍽️</div>
                  <span>Foodies Delight</span>
                </div>
                <p className="footer-tagline">
                  Bringing restaurant-quality meals to your doorstep since 2023
                </p>
                <div className="footer-info">
                  <span>© 2025 Foodies Delight.</span>
                  <span>All rights reserved.</span>
                  <span>📍 Serving 50+ cities</span>
                </div>
              </div>
            </footer>
          </div>
        }
      />
      <Route path="/menu" element={<Menu />} />
      <Route path="/orders" element={<OrdersList />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/order/:orderId" element={<OrderStatus />} />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWrapper;
