import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";
import CartSidebar from "./components/CartSidebar";
import Store from "./pages/Store";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Returns from "./pages/Returns";
import ProductDetail from "./pages/ProductDetail";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [watches, setWatches] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const userDisplayName = "Misafir";

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

  const addToCart = (watch) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.watch_id === watch.watch_id);
      if (existing) {
        toast.success(`${watch.watch_name} adedi artırıldı`);
        return prev.map((item) =>
          item.watch_id === watch.watch_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
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
      prev.map((item) =>
        item.watch_id === watch_id ? { ...item, quantity } : item
      )
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <Router>
        <Navbar
          userDisplayName={userDisplayName}
          cartCount={cartCount}
          logout={() => {}}
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
        </Routes>
        <ChatWidget />
      </Router>
    </ThemeProvider>
  );
}

export default App;
