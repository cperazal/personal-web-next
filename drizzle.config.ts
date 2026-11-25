import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Local commands read .env.local first (vercel env pull), then .env
config({ path: '.env.local' })
config({ path: '.env' })

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  strict: true,
  verbose: true,
})
