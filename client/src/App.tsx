import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Checkout from "./pages/Checkout";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";
import CartSidebar from "./components/CartSidebar";
import Store from "./pages/Store";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Returns from "./pages/Returns";
import ProductDetail from "./pages/ProductDetail";
import MyOrders from "./pages/MyOrders";
import AdminPanel from "./pages/AdminPanel";
import WatchCategoryPage from "./pages/WatchCategoryPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartItem, Customer, Watch } from "./types";
import { clearAuthData, getStoredCustomer } from "./utils/auth";

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(() => getStoredCustomer());

  const handleLogin = (customerData: Customer) => {
    setCustomer(customerData);
  };

  const handleLogout = () => {
    clearAuthData();
    setCustomer(null);
    setCart([]);
    toast.success("Logged out. See you soon! 👋");
  };

  const addToCart = (watch: Watch) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.watch_id === watch.watch_id);
      if (existing) {
        toast.success(`${watch.watch_name} quantity increased`);
        return prev.map((item) =>
          item.watch_id === watch.watch_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`${watch.watch_name} added to cart ✅`);
      return [...prev, { ...watch, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (watch_id: number) => {
    setCart((prev) => prev.filter((item) => item.watch_id !== watch_id));
  };

  const updateQuantity = (watch_id: number, quantity: number) => {
    if (quantity < 1) return removeFromCart(watch_id);
    setCart((prev) =>
      prev.map((item) => (item.watch_id === watch_id ? { ...item, quantity } : item))
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Toaster position="top-right" />
        <Router>
          <Navbar
            userDisplayName={customer ? customer.full_name : null}
            cartCount={cartCount}
            logout={handleLogout}
            onCartClick={() => setCartOpen(true)}
          />
          <CartSidebar
            cart={cart}
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            onOrderSuccess={() => setCart([])}
          />
          <Routes>
            <Route path="/" element={<Store addToCart={addToCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/watch/:id" element={<ProductDetail addToCart={addToCart} />} />
            <Route path="/login" element={customer ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
            <Route path="/checkout" element={<Checkout cart={cart} onOrderSuccess={() => setCart([])} />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/uhren" element={<WatchCategoryPage addToCart={addToCart} />} />
            <Route path="/register" element={customer ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
          </Routes>
          <ChatWidget />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
