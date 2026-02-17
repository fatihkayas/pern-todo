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
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [watches, setWatches] = useState([]);
  const userDisplayName = keycloak.tokenParsed?.preferred_username || "Müşteri";

  useEffect(() => {
    // KRİTİK: HTTPS ve 5443 portu!
    fetch("https://localhost:5443/watches")
      .then((res) => {
        if(!res.ok) throw new Error("Bağlantı reddedildi");
        return res.json();
      })
      .then((data) => {
        setWatches(Array.isArray(data) ? data : []);
        if(data.length > 0) toast.success("Saatler başarıyla yüklendi! ✅");
      })
      .catch((err) => {
        console.error("Fetch Hatası:", err);
        toast.error("Bağlantı hatası: Port 5443'ü kontrol edin. ❌");
      });
  }, []);

  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <Router>
        <Navbar userDisplayName={userDisplayName} cartCount={0} logout={() => keycloak.logout()} />
        <Routes>
          <Route path="/" element={<Store watches={watches} addToCart={() => {}} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/returns" element={<Returns />} />
        </Routes>
        <ChatWidget />
      </Router>
    </ThemeProvider>
  );
}

export default App;