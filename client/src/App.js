import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import keycloak from "./keycloak";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";
import Store from "./pages/Store";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Returns from "./pages/Returns";
import ProductDetail from "./pages/ProductDetail";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [watches, setWatches] = useState([]);
  const [cart, setCart] = useState([]);
  const userDisplayName = keycloak.tokenParsed?.preferred_username || "User";

  useEffect(() => {
    fetch("https://localhost:5443/watches")
      .then((res) => res.json())
      .then((data) => {
        setWatches(Array.isArray(data) ? data : []);
        toast.success(`${data.length} watches loaded ✅`);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setWatches([]);
        toast.error("Failed to load watches ❌");
      });
  }, []);

  const addToCart = (watch) => {
    setCart([...cart, watch]);
    toast.success(`${watch.watch_name} added to cart! 🛒`);
  };

  const removeFromCart = (index) => {
    const removed = cart[index];
    setCart(cart.filter((_, i) => i !== index));
    toast(`${removed.watch_name} removed`, { icon: "🗑️" });
  };

  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "10px", fontFamily: "Arial" },
        }}
      />
      <Router>
        <Navbar
          userDisplayName={userDisplayName}
          cartCount={cart.length}
          logout={() => keycloak.logout()}
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