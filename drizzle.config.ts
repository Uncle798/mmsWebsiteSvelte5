import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   out: './drizzle',
   schema: './drizzle/schema.ts',
   dbCredentials: {
      host: process.env.DATABASE_HOST!,
      user: process.env.DATABASE_USERNAME!,
      password: process.env.DATABASE_PASSWORD!,
      database: process.env.DATABASE_NAME!,
   },
   verbose: true,
   strict: true,
})