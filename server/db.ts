import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Robust connection pool with better error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reduced from 30 to prevent overwhelming the database
  min: 2, // Keep minimum connections alive
  idleTimeoutMillis: 30000, // 30 seconds idle timeout
  connectionTimeoutMillis: 5000, // 5 seconds to establish connection
  acquireTimeoutMillis: 5000, // 5 seconds to acquire connection from pool
  
  // SSL configuration for production databases
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Connection retry and error handling
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  
  // Query timeout
  query_timeout: 10000, // 10 seconds query timeout
  statement_timeout: 10000, // 10 seconds statement timeout
});

// Enhanced error handling for the pool
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  // Don't exit the process, let the pool handle reconnection
});

pool.on('connect', (client) => {
  console.log('Database connection established');
  
  // Set connection-level timeouts
  client.query('SET statement_timeout = 10000'); // 10 seconds
  client.query('SET idle_in_transaction_session_timeout = 30000'); // 30 seconds
});

pool.on('acquire', () => {
  console.log('Database connection acquired from pool');
});

pool.on('remove', () => {
  console.log('Database connection removed from pool');
});

// Create database instance with error handling
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development' ? {
    logQuery: (query, params) => {
      console.log('Query:', query);
      if (params && params.length > 0) {
        console.log('Params:', params);
      }
    }
  } : false
});

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});
