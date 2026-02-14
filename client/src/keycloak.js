import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080", // Podman'de çalışan Keycloak adresi
  realm: "WatchStore",          // Keycloak panelinde oluşturduğun isim
  clientId: "watch-app",       // Client ID olarak verdiğin isim
});

export default keycloak;