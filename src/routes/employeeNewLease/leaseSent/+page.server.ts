import { redirect, fail, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { anvilClient, getOrganizationalPacketVariables, getPersonalPacketVariables } from '$lib/server/anvil';
import { qStash } from '$lib/server/qStash';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee');
   }
   const leaseId = event.url.searchParams.get('leaseId');
   if(leaseId){
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: leaseId
         }
      })
      if(!lease){
         return error(404)
      }
      const unit = await prisma.unit.findFirst({
         where: {
            num: lease.unitNum
         }
      })
      const customer = await prisma.user.findUnique({
         where: {
            id: lease.customerId
         }
      });
      const address = await prisma.address.findUnique({
         where: {
            addressId: lease.addressId
         }
      })
      const employee = await prisma.user.findUnique({
         where: {
            id: event.locals.user.id
         }
      });
      let variables = {}
      if(customer?.organizationName){
         variables = getOrganizationalPacketVariables( customer, lease!, unit!, employee!, address!)
      } else {
         variables = getPersonalPacketVariables( customer!, lease!, unit!, employee!, address!)
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
         const notification = await qStash.notify({eventId:lease.leaseId, eventData:lease.leaseId});
         const invoice = await prisma.invoice.findFirst({
            where: {
               leaseId: lease.leaseId
            }
         });
         if(!invoice){
            return error(400)
         }
         const paymentRecord = await prisma.paymentRecord.findFirst({
            where: {
               invoiceNum: invoice.invoiceNum
            }
         })
         return { packetDetails, customer, paymentRecord, address };
      }
   }
   return { };
}) satisfies PageServerLoad;