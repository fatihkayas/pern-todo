// Usage: node scripts/import-watches.js <path-to-file.xlsx>
// Excel columns expected: brand, reference (or ref/model_code), price
// Remaining fields (stock, description, image_url) can be filled later.

"use strict";

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const xlsx = require("xlsx");
const { Client } = require("pg");
const path = require("path");
const { randomUUID } = require("crypto");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/import-watches.js <file.xlsx>");
  process.exit(1);
}

const DB = {
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE || "jwtauth",
};

// Case-insensitive header lookup
function findCol(headers, ...candidates) {
  for (const c of candidates) {
    const found = headers.find((h) => h.toLowerCase().trim() === c.toLowerCase());
    if (found) return found;
  }
  return null;
}

async function main() {
  const resolvedPath = path.resolve(filePath);
  const isCsv = resolvedPath.toLowerCase().endsWith(".csv");

  // Auto-detect delimiter: read first line and pick ; or ,
  const fs = require("fs");
  const firstLine = fs.readFileSync(resolvedPath, "utf8").split("\n")[0];
  const delimiter = firstLine.includes(";") ? ";" : ",";

  const workbook = xlsx.readFile(resolvedPath, isCsv ? { FS: delimiter } : {});
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  if (rows.length === 0) {
    console.error("Excel dosyası boş.");
    process.exit(1);
  }

  const headers = Object.keys(rows[0]);
  const colBrand = findCol(headers, "brand", "marka");
  const colRef   = findCol(headers, "reference", "referans", "ref", "model_code", "model");
  const colPrice = findCol(headers, "price", "fiyat");

  if (!colBrand || !colRef || !colPrice) {
    console.error("Gerekli sütunlar bulunamadı. Bulunan sütunlar:", headers.join(", "));
    console.error("Beklenen: brand/marka, reference/referans/ref, price/fiyat");
    process.exit(1);
  }

  console.log(`Sütunlar: brand="${colBrand}", reference="${colRef}", price="${colPrice}"`);
  console.log(`Toplam satır: ${rows.length}`);

  const client = new Client(DB);
  await client.connect();
  console.log("DB bağlantısı kuruldu.\n");

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const brand    = String(row[colBrand] || "").trim();
    const ref      = String(row[colRef]   || "").trim();
    // Strip currency symbols/spaces, convert European comma-decimal to dot
    const rawPrice = String(row[colPrice] || "").replace(/[€$£\s]/g, "").replace(",", ".");
    const price    = parseFloat(rawPrice);

    if (!brand && !ref) { skipped++; continue; }
    if (isNaN(price)) {
      console.warn(`  SKIP: geçersiz fiyat "${row[colPrice]}" — ${brand} ${ref}`);
      skipped++;
      continue;
    }

    const watchName = [brand, ref].filter(Boolean).join(" ");

    await client.query(
      `INSERT INTO watches (watch_id, watch_name, brand, model_code, price, stock_quantity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 0, NOW(), NOW())`,
      [randomUUID(), watchName, brand || null, ref || null, price]
    );

    inserted++;
    process.stdout.write(`  [${inserted}] ${watchName} — ${price}\n`);
  }

  await client.end();

  console.log(`\nTamamlandı: ${inserted} eklendi, ${skipped} atlandı.`);
}

main().catch((err) => {
  console.error("Hata:", err.message);
  process.exit(1);
});
