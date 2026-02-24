import { POSTGRES_PRISMA_URL } from '$env/static/private';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaNeon} from '@prisma/adapter-neon'

const adapter = new PrismaNeon({
   connectionString: POSTGRES_PRISMA_URL
});
export const prisma = new PrismaClient({
   adapter 
});