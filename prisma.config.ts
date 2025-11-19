import "dotenv/config"
import path from "node:path";
import type { PrismaConfig, } from 'prisma';
import { env } from 'prisma/config';

export default {
   schema: path.join('prisma', 'schema.prisma'),
   datasource: {
      url: env("POSTGRES_PRISMA_URL")
   },
   migrations: {
      seed: 'tsx prisma/seed.ts'
   },
} satisfies PrismaConfig