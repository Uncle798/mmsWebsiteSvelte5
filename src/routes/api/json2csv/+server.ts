import { makeAllUnitsCSV } from '$lib/server/json2csv/json2csv';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
   if(!event.locals.user?.employee){
      return new Response(JSON.stringify('Must be an employee'), {status: 401})
   }
   const allUnits = event.url.searchParams.get('allUnits');
   if(allUnits === 'true'){
      const units = await prisma.unit.findMany({
         orderBy: {
            num: 'asc'
         }
      });
      const customers = await prisma.user.findMany({
         where: {
            customerLeases: {
               some: {
                  leaseEnded: null
               }
            }
         }
      });
      const leases = await prisma.lease.findMany({
         where: {
            leaseEnded: null
         }
      });
      const invoices = await prisma.invoice.findMany({
         where: {
            customer: {
               customerLeases: {
                  some: {
                     leaseEnded: null
                  }
               }
            }
         }
      })
      const csv = await makeAllUnitsCSV(units, leases, customers, invoices);
      console.log(csv);
      return new Response(JSON.stringify(csv), {status: 200});
   }
   return new Response();
};