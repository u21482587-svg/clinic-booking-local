import pool from './db.js';
import 'dotenv/config';

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Table "bookings" created or already exists.');
  } catch (err) {
    console.error('❌ Error creating table:', err);
  }
  pool.end();
}

createTable();
