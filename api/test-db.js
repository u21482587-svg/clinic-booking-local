import pool from "./db.js";

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ DB connected successfully:", res.rows[0]);
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  } finally {
    pool.end();
  }
}

testConnection();
