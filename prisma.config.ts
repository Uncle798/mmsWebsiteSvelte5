import "dotenv/config"
import path from "node:path";
import type { PrismaConfig } from 'prisma'

process.loadEnvFile();

export default {
   schema: path.join('prisma', 'schema.prisma'),
   migrations: {
      seed: `tsx prisma/seed.ts`
   }
   
} satisfies PrismaConfig