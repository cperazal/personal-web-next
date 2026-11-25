import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Neon's HTTP driver: one request per query, ideal for serverless/ISR.
// DATABASE_URL is created by the Vercel ↔ Neon integration.
function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing DATABASE_URL. Connect Neon in Vercel (Storage) and pull the env vars.')
  }
  return drizzle(neon(url), { schema })
}

let _db: ReturnType<typeof createDb> | null = null

/** Lazily created so builds without DATABASE_URL don't crash at import time */
export function getDb() {
  if (!_db) _db = createDb()
  return _db
}

export { schema }
