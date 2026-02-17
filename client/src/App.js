import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import keycloak from "./keycloak";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";
import Store from "./pages/Store";
import About from "./pages/About";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [watches, setWatches] = useState([]);
  const [cart, setCart] = useState([]);
  const userDisplayName = keycloak.tokenParsed?.preferred_username || "Müşteri";

  useEffect(() => {
    fetch("http://localhost:5000/watches")
      .then((res) => res.json())
      .then((data) => {
        setWatches(data);
        toast.success(`${data.length} saat yüklendi ✅`);
      })
      .catch((err) => {
        console.error("Veri hatası:", err);
        toast.error("Saatler yüklenemedi ❌");
      });
  }, []);

  const addToCart = (watch) => {
    setCart([...cart, watch]);
    toast.success(`${watch.watch_name} sepete eklendi! 🛒`);
  };

  const removeFromCart = (index) => {
    const removed = cart[index];
    setCart(cart.filter((_, i) => i !== index));
    toast(`${removed.watch_name} sepetten çıkarıldı`, { icon: "🗑️" });
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
          <Route
            path="/"
            element={<Store watches={watches} addToCart={addToCart} />}
          />
          <Route path="/about" element={<About />} />
        </Routes>

        {/* Sepet Modalı */}
        <div
          className="modal fade"
          id="cartModal"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Sepetim ({cart.length})</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                {cart.length === 0 ? (
                  <p className="text-muted text-center">Sepetiniz boş</p>
                ) : (
                  <>
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom"
                      >
                        <span>{item.watch_name}</span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(index)}
                        >
                          Sil
                        </button>
                      </div>
                    ))}
                    <button
                      className="btn btn-primary w-100 mt-3"
                      onClick={() => {
                        toast.success("Siparişiniz alındı! 🎉");
                      }}
                    >
                      Ödemeye Geç
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <ChatWidget />
      </Router>
    </ThemeProvider>
  );
}

export default App;
