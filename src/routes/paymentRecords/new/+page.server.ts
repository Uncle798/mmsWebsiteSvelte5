import { prisma } from '$lib/server/prisma';
import {redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const customers = await prisma.user.findMany({
      where: {
         OR:[
            {
               customerLeases: {
                  some: {
                     leaseEnded: null
                  }
               }
            },
            {
               customerInvoices: {
                  some: {
                     paymentRecordNum: null
                  }
               }
            }
         ]
      },
      orderBy: [
         {familyName: 'asc'}, 
         {givenName: 'asc'}
      ],
   })
   const invoices = await prisma.invoice.findMany({
      where: {
         paymentRecordNum: null
      }
   })
    return { customers, invoices };
}) satisfies PageServerLoad;