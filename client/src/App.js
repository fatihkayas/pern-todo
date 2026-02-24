import React, { useEffect, useState } from "react";
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
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [watches, setWatches] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem("customer");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    fetch("/api/watches")
      .then((res) => {
        if (!res.ok) throw new Error("Bağlantı reddedildi");
        return res.json();
      })
      .then((data) => {
        setWatches(Array.isArray(data) ? data : []);
        if (data.length > 0) toast.success("Saatler başarıyla yüklendi! ✅");
      })
      .catch((err) => {
        console.error("Fetch Hatası:", err);
        toast.error("Bağlantı hatası: Backend erişilemiyor ❌");
      });
  }, []);

  const handleLogin = (customerData) => {
    setCustomer(customerData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    setCustomer(null);
    setCart([]);
    toast.success("Çıkış yapıldı. Görüşürüz! 👋");
  };

  const addToCart = (watch) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.watch_id === watch.watch_id);
      if (existing) {
        toast.success(`${watch.watch_name} adedi artırıldı`);
        return prev.map((item) =>
          item.watch_id === watch.watch_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`${watch.watch_name} sepete eklendi ✅`);
      return [...prev, { ...watch, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (watch_id) => {
    setCart((prev) => prev.filter((item) => item.watch_id !== watch_id));
  };

  const updateQuantity = (watch_id, quantity) => {
    if (quantity < 1) return removeFromCart(watch_id);
    setCart((prev) =>
      prev.map((item) => item.watch_id === watch_id ? { ...item, quantity } : item)
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ThemeProvider>
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
          <Route path="/" element={<Store watches={watches} addToCart={addToCart} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/watch/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/login" element={customer ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/checkout" element={<Checkout cart={cart} onOrderSuccess={() => setCart([])} />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/register" element={customer ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
        </Routes>
        <ChatWidget />
      </Router>
    </ThemeProvider>
  );
}

export default App;

