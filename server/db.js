const Pool = require("pg").Pool;
require('dotenv').config(); // .env dosyasındaki verileri okumayı sağlar

const pool = new Pool({
  user: "postgres",
  password: process.env.DB_PASSWORD, // Artık şifre burada açıkça yazmıyor
  host: "localhost",
  port: 5432,
  database: "jwtauth"
});

module.exports = pool;