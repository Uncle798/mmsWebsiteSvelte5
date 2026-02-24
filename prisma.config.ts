import "dotenv/config"
import path from "node:path";
import { env, defineConfig } from 'prisma/config';

export default defineConfig({
   schema: path.join('prisma', 'schema.prisma'),
   datasource: {
      url: env("POSTGRES_PRISMA_URL")
   },
   migrations: {
      seed: 'tsx prisma/seed.ts'
   },
});