import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';
import type { PageServerLoad } from './$types';

export const load = (async () => {
   const leases = prisma.lease.findMany({
      where: {
         leaseEnded:{
            gt: dayjs(new Date()).subtract(1, 'year').toDate()
         }
      },
      orderBy: {
         leaseEnded: 'desc'
      }
   })
   return { leases,};
}) satisfies PageServerLoad;