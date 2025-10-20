// api/create-table.js
import pool from './db.js';

const create = `
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

pool.query(create)
  .then(() => { console.log('✅ bookings table ready'); process.exit(0); })
  .catch((e)=>{ console.error(e); process.exit(1); });
