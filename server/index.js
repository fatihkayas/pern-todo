const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// --- KULLANICI ROTALARI ---
app.get("/users", async (req, res) => {
    try {
        const allUsers = await pool.query("SELECT * FROM users");
        res.json(allUsers.rows);
    } catch (err) { console.error(err.message); }
});

// --- SAAT ROTALARI (Yeni Eklenen) ---
app.get("/watches", async (req, res) => {
  try {
    const allWatches = await pool.query("SELECT * FROM watches");
    res.json(allWatches.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası: Saatler getirilemedi");
  }
});

// ... Diğer POST, DELETE rotaların burada kalsın ...

// EN ALTTA OLMALI
app.listen(5000, () => {
    console.log("server has started on port 5000");
});

