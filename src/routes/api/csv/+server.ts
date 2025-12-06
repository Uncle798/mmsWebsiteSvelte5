import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Invoice, User } from '../../../generated/prisma/client';
import dayjs from 'dayjs';
import { stringify } from 'csv';

export const GET: RequestHandler = async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized');
   }
   const allUnits = event.url.searchParams.get('allUnits');
   if(allUnits === 'true'){
      const units = await prisma.unit.findMany({
         orderBy: {
            num: 'asc'
         }
      });
      const leases = await prisma.lease.findMany({
         where: {
            leaseEnded: null
         }
      });
      const customers = await prisma.user.findMany({
         where: {
            customerLeases: {
               some: {
                  leaseEnded: null,
               }
            }
         }
      });
      const invoices = await prisma.invoice.findMany({
         where: {
            amountPaid: {
               lt: prisma.invoice.fields.invoiceAmount
            }
         },
         orderBy: {
            invoiceCreated: 'asc'
         }
      })
      const allJSON:{
         unitNum: string,
         size: string,
         familyName:string,
         givenName: string,
         nextDueDate: string,
         leasedPrice: number,
         advertisedPrice: number
      }[] = [];
      for(const unit of units){
         const lease = leases.find((lease) => lease.unitNum === unit.num);
         let customer: User | undefined = undefined;
         let customerInvoices:Invoice[] = [];
         if(lease){
            customer = customers.find((customer) => customer.id === lease.customerId);
         }
         if(customer){
            customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id);
         }
         let sortingName = customer?.organizationName ? customer.organizationName : customer?.familyName;
         if(sortingName === null || sortingName === undefined){
            sortingName = ''
         }
         const json = {
            unitNum: unit.num.replace(/^0+/gm, ''),
            size: unit.size.replace(/0/gm,'').replace(/x0/gm, 'x'),
            familyName: sortingName,
            givenName: customer?.givenName ? customer.givenName : '',
            nextDueDate: customerInvoices[0]?.invoiceDue ? dayjs(customerInvoices[0].invoiceDue).format('MM/DD/YYYY') : '',
            leasedPrice: unit.leasedPrice ? unit.leasedPrice : 0,
            advertisedPrice: unit.advertisedPrice,
         }
         allJSON.push(json);
      }
      const data:string[] = [];
      const csv = stringify(allJSON, {
         header: true
      }).end();
      
      return new Response(JSON.stringify(data.join('')), {status: 200});
   }
   return new Response();
};