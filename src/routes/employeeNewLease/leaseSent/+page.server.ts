import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { anvilClient, getOrganizationalPacketVariables, getPersonalPacketVariables } from '$lib/server/anvil';
import { qStash } from '$lib/server/qStash';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee');
   }
   const paymentNumber = event.url.searchParams.get('paymentNumber');
   if(paymentNumber){
      const paymentRecord = await prisma.paymentRecord.findUnique({
         where: {
            paymentNumber:parseInt(paymentNumber, 10),
         }
      })
      if(!paymentRecord){
         return fail(404, {message:'Payment record not found'});
      }
      const invoice = await prisma.invoice.findUnique({
         where: {
            invoiceNum: paymentRecord.paymentNumber
         },
      });
      if(!invoice){
         return fail(404, {message: 'invoice not found'})
      }
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: invoice.leaseId!
         }
      })
      const unit = await prisma.unit.findFirst({
         where: {
            num: lease?.unitNum
         }
      })
      const customer = await prisma.user.findUnique({
         where: {
            id: paymentRecord.customerId
         }
      })
      if(lease?.anvilEID){
         return { customer, }
      }
      const employee = await prisma.user.findUnique({
         where: {
            id: event.locals.user.id
         }
      });
      let variables = {}
      if(customer?.organizationName){
         variables = getOrganizationalPacketVariables( customer, lease!, unit!, employee!)
      } else {
         variables = getPersonalPacketVariables( customer!, lease!, unit!, employee!)
      }
      const { data, errors } = await anvilClient.createEtchPacket({variables})
      if (errors) {
         // Note: because of the nature of GraphQL, statusCode may be a 200 even when
         // there are errors.
         console.error('There were errors!')
         console.error(JSON.stringify(errors, null, 2));
         console.error(data?.data['createEtchPacket'])
      } else {
         const packetDetails = data?.data['createEtchPacket']
         const anvilEID = packetDetails['eid']
         await prisma.lease.update({
            where: {
               leaseId: lease?.leaseId
            },
            data: {
               anvilEID 
            }
         })
         await qStash.notify({eventId:lease!.leaseId})
         return { packetDetails, customer };
      }
   }
   return { };
}) satisfies PageServerLoad;