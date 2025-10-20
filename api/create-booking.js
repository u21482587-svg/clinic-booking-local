// api/create-booking.js (serverless function)
import pool from './db.js';

export default async function handler(req, res) {
  const { name, time } = req.body;
  const result = await pool.query(
    'INSERT INTO bookings (name, time) VALUES ($1, $2) RETURNING id',
    [name, time]
  );
  res.status(201).json({ id: result.rows[0].id });
}
