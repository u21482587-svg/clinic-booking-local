import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL not set');
}

let pool;
if (global.__pgPool) {
  pool = global.__pgPool;
} else {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Neon needs SSL
  });
  global.__pgPool = pool;
}

export default pool;




