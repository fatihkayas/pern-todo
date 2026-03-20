// TEMPORARY — used only for running migrations against GCP Cloud SQL via Cloud SQL Auth Proxy
// DO NOT commit this file — contains DB credentials
// Delete after migrations are complete
module.exports = {
  "gcp-cloudsql": {
    username: "psqladmin",
    password: "SeikoGCP2026!",
    database: "jwtauth",
    host: "127.0.0.1",
    port: 5433,
    dialect: "postgres",
    dialectOptions: {
      ssl: false,
    },
  },
};
