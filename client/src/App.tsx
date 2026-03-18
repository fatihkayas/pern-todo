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
import { LanguageProvider } from "./context/LanguageContext";
import { Watch, CartItem, Customer, PizzaCartItem } from "./types";
import { apiUrl } from "./config";
import { IS_PIZZA } from "./config/branding";
import RestaurantPage from "./domains/pizza/RestaurantPage";

function App() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pizzaCart, setPizzaCart] = useState<PizzaCartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem("customer");
    return saved ? (JSON.parse(saved) as Customer) : null;
  });

  useEffect(() => {
    if (IS_PIZZA) {
      return;
    }

    fetch(apiUrl("/api/v1/watches"))
      .then((res) => {
        if (!res.ok) throw new Error("Connection refused");
        return res.json();
      })
      .then((data: Watch[]) => {
        setWatches(Array.isArray(data) ? data : []);
        if (data.length > 0) toast.success("Watches loaded successfully!");
      })
      .catch((err: Error) => {
        console.error("Fetch error:", err);
        toast.error("Connection error: Backend unreachable");
      });
  }, []);

  const handleLogin = (customerData: Customer) => {
    setCustomer(customerData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    setCustomer(null);
    setCart([]);
    setPizzaCart([]);
    toast.success("Logged out. See you soon!");
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
      toast.success(`${watch.watch_name} added to cart`);
      return [...prev, { ...watch, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (watch_id: number) => {
    setCart((prev) => prev.filter((item) => item.watch_id !== watch_id));
  };

  const removePizzaFromCart = (cart_item_id: string) => {
    setPizzaCart((prev) => prev.filter((item) => item.cart_item_id !== cart_item_id));
  };

  const updatePizzaQuantity = (cart_item_id: string, quantity: number) => {
    if (quantity < 1) return removePizzaFromCart(cart_item_id);
    setPizzaCart((prev) =>
      prev.map((item) =>
        item.cart_item_id === cart_item_id ? { ...item, quantity } : item
      )
    );
  };

  const addPizzaToCart = (item: PizzaCartItem) => {
    setPizzaCart((prev) => {
      const key = item.cart_item_id;
      const existing = prev.find((p) => p.cart_item_id === key);
      if (existing) {
        toast.success(`${item.name} quantity increased`);
        return prev.map((p) =>
          p.cart_item_id === key ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      toast.success(`${item.name} added to cart`);
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const updateQuantity = (watch_id: number, quantity: number) => {
    if (quantity < 1) return removeFromCart(watch_id);
    setCart((prev) =>
      prev.map((item) => (item.watch_id === watch_id ? { ...item, quantity } : item))
    );
  };

  const cartCount = IS_PIZZA
    ? pizzaCart.reduce((sum, item) => sum + item.quantity, 0)
    : cart.reduce((sum, item) => sum + item.quantity, 0);

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
            pizzaCart={pizzaCart}
            removePizzaFromCart={removePizzaFromCart}
            updatePizzaQuantity={updatePizzaQuantity}
          />
          <Routes>
            <Route
              path="/"
              element={
                IS_PIZZA ? (
                  <RestaurantPage
                    onDirectOrder={addPizzaToCart}
                    onOpenCart={() => setCartOpen(true)}
                  />
                ) : (
                  <Store watches={watches} addToCart={addToCart} />
                )
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/watch/:id" element={<ProductDetail addToCart={addToCart} />} />
            <Route
              path="/login"
              element={customer ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/checkout"
              element={
                <Checkout
                  cart={cart}
                  pizzaCart={pizzaCart}
                  onOrderSuccess={() => {
                    setCart([]);
                    setPizzaCart([]);
                  }}
                />
              }
            />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route
              path="/register"
              element={customer ? <Navigate to="/" /> : <Register onLogin={handleLogin} />}
            />
          </Routes>
          <ChatWidget />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
