import React, { useEffect, useState } from "react";
import keycloak from "./keycloak";

function App() {
  // --- HOOKS (Mutlaka fonksiyon içinde olmalı) ---
  const [users, setUsers] = useState([]);
  const [watches, setWatches] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cart, setCart] = useState([]);

  const userDisplayName = keycloak.tokenParsed?.preferred_username || "Müşteri";

  // --- FONKSİYONLAR ---
  const fetchData = async () => {
    try {
      const userRes = await fetch("http://localhost:5000/users");
      const userData = await userRes.json();
      setUsers(userData);

      const watchRes = await fetch("http://localhost:5000/watches");
      const watchData = await watchRes.json();
      setWatches(watchData);
    } catch (err) {
      console.error("Veri çekme hatası:", err.message);
    }
  };

  const addToCart = (watch) => {
    setCart([...cart, watch]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { name, email, password: "123" };
      await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      fetchData();
      setName("");
      setEmail("");
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- GÖRÜNÜM (RENDER) ---
  return (
    <div className="container mt-4 mb-5">
      
      {/* ÜST BAR */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded-4">
        <h4>👋 Merhaba, <span className="text-primary">{userDisplayName}</span></h4>
        
        <div className="d-flex align-items-center">
          {/* SEPET BUTONU */}
          <div 
            className="me-4 position-relative" 
            style={{ cursor: "pointer" }}
            data-bs-toggle="modal" 
            data-bs-target="#cartModal"
          >
            <span style={{ fontSize: "1.8rem" }}>🛒</span>
            {cart.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cart.length}
              </span>
            )}
          </div>
          <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => keycloak.logout()}>Çıkış</button>
        </div>
      </div>

      {/* ADMIN PANELI (Opsiyonel) */}
      <div className="card shadow-sm p-4 mb-5 border-0 rounded-4">
        <h3 className="mb-3">🚀 Admin Dashboard</h3>
        <form className="d-flex mb-3" onSubmit={onSubmitForm}>
          <input className="form-control me-2" placeholder="İsim" value={name} onChange={e => setName(e.target.value)} required />
          <input className="form-control me-2" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} required />
          <button className="btn btn-success">Ekle</button>
        </form>
        {/* Kullanıcı Listesi */}
        <ul className="list-group">
          {users.map(user => (
            <li key={user.user_id} className="list-group-item d-flex justify-content-between">
              {user.user_name} ({user.user_email})
            </li>
          ))}
        </ul>
      </div>

      {/* SAAT VİTRİNİ */}
      <h3 className="text-center mb-4 fw-bold">⌚ Özel Koleksiyon</h3>
      <div className="row">
        {watches.map(watch => (
          <div className="col-md-4 mb-4" key={watch.watch_id}>
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="p-3 text-center bg-light">
                <img src={watch.image_url} alt={watch.watch_name} className="img-fluid" style={{maxHeight: "150px"}} 
                     onError={(e) => e.target.src="https://via.placeholder.com/150?text=Saat"} />
              </div>
              <div className="card-body">
                <h5 className="fw-bold">{watch.watch_name}</h5>
                <p className="small text-muted">{watch.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h4 text-success">${watch.price}</span>
                  <button className="btn btn-dark rounded-pill" onClick={() => addToCart(watch)}>Sepete Ekle</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- SEPET MODAL (AÇILIR PENCERE) --- */}
      <div className="modal fade" id="cartModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header bg-dark text-white rounded-top-4">
              <h5 className="modal-title">🛒 Sepetim</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {cart.length === 0 ? (
                <p className="text-center py-3">Sepetiniz henüz boş.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {cart.map((item, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{item.watch_name}</span>
                      <div>
                        <span className="me-3">${item.price}</span>
                        <button className="btn btn-sm btn-link text-danger" onClick={() => removeFromCart(index)}>Sil</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Toplam:</span>
                <span className="text-primary">${cart.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-primary w-100 rounded-pill" onClick={() => alert("Ödeme Başarılı! (Simülasyon)")} disabled={cart.length === 0}>
                Ödemeyi Tamamla 🚀
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;