// bookings.js
import pool from "./db.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { name, email, phone, booking_date, booking_time, notes } = req.body || {};

  if (!name || !booking_date) {
    return res.status(400).json({ error: "name and booking_date are required" });
  }

  try {
    const query = `
      INSERT INTO bookings (name, email, phone, booking_date, booking_time, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at;
    `;
    const values = [name, email || null, phone || null, booking_date, booking_time || null, notes || null];

    const result = await pool.query(query, values);
    return res.status(201).json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error("DB insert error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}


import pool from "./db.js";

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error("DB connection error:", err);
  else console.log("DB connected successfully:", res.rows[0]);
});
