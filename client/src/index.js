import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import keycloak from "./keycloak";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

keycloak
  .init({
    onLoad: "check-sso",
    silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
    checkLoginIframe: false,
    pkceMethod: "S256",
  })
  .then((authenticated) => {
    if (authenticated) {
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } else {
      keycloak.login();
    }
  })
  .catch((err) => {
    console.error("Keycloak error:", err);
    root.render(
      <div className="container mt-5 text-center">
        <h2 className="text-danger">Bağlantı Hatası</h2>
        <p>Keycloak sunucusuna ulaşılamıyor. Podman çalışıyor mu?</p>
      </div>
    );
  });

reportWebVitals();
