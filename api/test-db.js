import pool from "./db.js";

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ DB connected successfully:", res.rows[0]);
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
})();
