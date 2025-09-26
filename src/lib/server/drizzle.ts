import { POSTGRES_PRISMA_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/neon-http';

export const db = drizzle(POSTGRES_PRISMA_URL);
