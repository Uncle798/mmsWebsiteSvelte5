import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { unitNotesFormSchema } from '$lib/formSchemas/schemas';

export const load = (async () => {
   const units = prisma.unit.findMany({
      where: {
         lease: {
            some: {
               leaseEnded: {
                  gt: dayjs(new Date()).subtract(1,'year').toDate()
               }
            }
         }
      }
   })
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
   const customers = prisma.user.findMany({
      where: {
         customerLeases: {
            some: {
               leaseEnded: {
                  gt: dayjs(new Date()).subtract(1, 'year').toDate()
               }
            }
         }
      }
   })
   const addresses = prisma.address.findMany({
      where: {
         leases: {
            some: {
               leaseEnded: {
                  gt: dayjs().subtract(1, 'year').toDate()
               }
            }
         }
      }
   })
   const unitNotesForm = await superValidate(valibot(unitNotesFormSchema))
   return { units, leases, unitNotesForm, customers, addresses };
}) satisfies PageServerLoad;