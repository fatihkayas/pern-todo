const express = require("express");
const app = express();    
const cors = require("cors");

//middöeware

app.use(cors());
app.use(express.json());

// database

const pool = require("./db"); // db.js bağlantısını aldık

// Tüm kullanıcıları getir (GET)
app.get("/users", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows); // Veritabanından gelen satırları JSON olarak gönder
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// Kullanıcı Kaydı Yap (POST)
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password) VALUES($1, $2, $3) RETURNING *",
      [name, email, password]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Kayıt sırasında hata oluştu");
  }
});


app.listen(5000, () => {
    console.log("server has started on port 5000");
});