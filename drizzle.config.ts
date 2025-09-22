import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './services/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.EXTERNAL_DATABASE_URL!,
  },
});