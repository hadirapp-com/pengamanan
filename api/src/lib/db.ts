import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  ssl: 'prefer',
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
});

// Create the database instance for pengamanan schema
export const db = drizzle(client, { schema, logger: process.env.DATABASE_LOGGER !== 'false' });

// Export the client for manual disconnection if needed
export { client };
