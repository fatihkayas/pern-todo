"use strict";
const path = require("path");
const fs = require("fs");
const { Client } = require("pg");

const CSV_PATH = path.join(__dirname, "STOCK PSB WATCHES SUPPLIER G 19-05(Feuil1).csv");

const DB = { user: "postgres", password: "your_password", host: "localhost", port: 5433, database: "jwtauth" };

function parsePrice(raw) {
  if (!raw) return 0;
  const n = parseFloat(raw.replace(/[^\d,\.]/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

async function main() {
  const client = new Client(DB);
  await client.connect();
  console.log("Connected");

  const text = fs.readFileSync(CSV_PATH, "latin1");
  const lines = text.split("\n").filter(l => l.trim());
  const headers = lines[0].split(";").map(h => h.trim().toLowerCase());

  const bi = headers.indexOf("brand");
  const mi = headers.indexOf("model_code");
  const pi = headers.indexOf("price");
  const si = headers.indexOf("stock_quantity");
  const di = headers.indexOf("description");
  const ii = headers.indexOf("image_url");

  await client.query("DELETE FROM order_items");
  await client.query("DELETE FROM watches");
  console.log("Cleared watches");

  let imported = 0, skipped = 0;
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(";");
    const brand = (c[bi] || "").trim();
    const model = (c[mi] || "").trim();
    if (!brand || !model) { skipped++; continue; }

    await client.query(
      "INSERT INTO watches (watch_id,brand,model_code,watch_name,price,stock_quantity,description,image_url) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7)",
      [brand, model, brand+" "+model, parsePrice(c[pi]), parseInt(c[si])||0, (c[di]||"").trim()||null, (c[ii]||"").trim()||null]
    );
    imported++;
    if (imported % 500 === 0) console.log("  "+imported+" imported...");
  }
  console.log("Imported: "+imported+", skipped: "+skipped);

  const upd = [
    "UPDATE watches SET category = 'classic'",
    "UPDATE watches SET category = 'automatic' WHERE brand IN ('Seiko','ORIENT','Tissot','Hamilton','Longines','Certina','MIDO','Junghans')",
    "UPDATE watches SET category = 'automatic' WHERE UPPER(model_code) ~ '^(SARB|SKX|SRP|SPB|SBDC|SBGR|NH|4R|6R|8L)'",
    "UPDATE watches SET category = 'chronograph' WHERE UPPER(model_code) ~ '(CAR|CBM|SNDX|CBN|SSB|SPC|SNDG|SNDV|SNDD)'",
    "UPDATE watches SET category = 'diver' WHERE UPPER(model_code) ~ '^(SKX|SBDC|SNE|SRP|SRPD|SBDX|SH5|SH6)'",
    "UPDATE watches SET category = 'sport' WHERE brand IN ('CASIO','G-SHOCK','Baby-G') OR UPPER(model_code) ~ '^(GA|GW|GBA|EFV|EFR|MTG|MTP)'",
    "UPDATE watches SET category = 'luxury' WHERE brand IN ('TAG Heuer','Gucci','Versace','Swarovski','Salvatore Ferragamo','Balmain','Movado','Emporio Armani','Michael Kors','Diesel','Guess','Daniel Wellington','Armani Exchange')",
  ];
  for (const sql of upd) {
    const r = await client.query(sql);
    console.log("  "+r.rowCount+" rows: "+sql.substring(0,60));
  }

  const {rows} = await client.query("SELECT category, COUNT(*) as n FROM watches GROUP BY category ORDER BY n DESC");
  console.table(rows);
  await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
