import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { dateSearchFormSchema, refundFormSchema, searchFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { arrayOfYears } from '$lib/server/utils';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee&redirectTo=paymentRecords');
   }
   const invoiceNum = event.url.searchParams.get('invoiceNum');
   const searchForm = await superValidate(valibot(searchFormSchema));
   const dateSearchForm = await superValidate(valibot(dateSearchFormSchema));
   const refundForm = await superValidate(valibot(refundFormSchema));
   if(invoiceNum){
      const invoice = await prisma.invoice.findFirstOrThrow({
         where: {
            invoiceNum: parseInt(invoiceNum, 10)
         }
      });
      if(invoice){
         const paymentRecords = prisma.paymentRecord.findMany({
            where: {
               invoiceNum: invoice.invoiceNum,
            }
         })
         const customer = prisma.user.findFirst({
            where: {
               id:invoice.customerId
            }
         });
         const address = prisma.address.findFirst({
            where: {
               AND: [
                  {
                     softDelete: false
                  },
                  {
                     userId: invoice.customerId
                  }
               ]
            }
         });
         return {
            invoice, 
            paymentRecords, 
            searchForm, 
            customer, 
            dateSearchForm, 
            address, 
            refundForm
         };
      }
   }
   const paymentRecordCount = await prisma.paymentRecord.count();
   const firstPayment = await prisma.paymentRecord.findFirst({
      orderBy: {
         paymentCreated: 'asc'
      }
   })
   const years = arrayOfYears(firstPayment?.paymentCreated.getFullYear())
   const paymentRecords = prisma.paymentRecord.findMany({
      orderBy: {
         paymentCreated: 'desc'
      },
   });
   const customers = prisma.user.findMany({});
   const addresses = prisma.address.findMany({
      where: {
         softDelete: false
      }
   });
   return { 
      paymentRecords, 
      searchForm, 
      paymentRecordCount, 
      years, 
      customers, 
      dateSearchForm, 
      addresses, 
      refundForm
   };
}) satisfies PageServerLoad;
