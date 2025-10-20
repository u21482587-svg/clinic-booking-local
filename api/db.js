// api/db.js
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL not set');
}

// Reuse pool across lambda calls (avoids too many DB connections)
let pool;
if (global.__pgPool) {
  pool = global.__pgPool;
} else {
  pool = new Pool({
    connectionString,
    // some hosts require SSL; if your provider needs it, uncomment:
    // ssl: { rejectUnauthorized: false }
  });
  global.__pgPool = pool;
}

export default pool;

