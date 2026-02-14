import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import keycloak from './keycloak';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 🚀 Keycloak'u burada ayağa kaldırıyoruz
keycloak.init({ 
  onLoad: 'login-required', // Giriş yapmayana Seiko yok!
  checkLoginIframe: false 
}).then((authenticated) => {
  if (authenticated) {
    // Sadece giriş başarılıysa App bileşenini render et
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    // Giriş başarısızsa (nadir bir durum) sayfayı yenile
    window.location.reload();
  }
}).catch((err) => {
  console.error("Keycloak Başlatma Hatası:", err);
  root.render(
    <div className="container mt-5 text-center">
      <h2 className="text-danger">Bağlantı Hatası</h2>
      <p>Keycloak sunucusuna ulaşılamıyor. Lütfen Podman'i kontrol et!</p>
    </div>
  );
});

reportWebVitals();