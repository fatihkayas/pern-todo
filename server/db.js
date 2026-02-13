const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "1234", // Buraya kurulumda koyduğun şifreyi yaz
  host: "localhost",
  port: 5432,
  database: "jwtauth" // BURASI ÇOK ÖNEMLİ!
});

module.exports = pool;