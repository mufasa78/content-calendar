import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkConnection() {
  try {
    await client.connect();
    console.log("Successfully connected to the database!");
    const res = await client.query('SELECT NOW()');
    console.log("Database time:", res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  }
}

checkConnection();
