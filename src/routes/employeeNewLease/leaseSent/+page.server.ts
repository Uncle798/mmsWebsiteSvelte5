import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { anvilClient, getPacketVariables, } from '$lib/server/anvil';
import { inngest } from '$lib/server/inngest/inngest';

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
      });
      if(!unit){
         return error(500, 'Unit not found');
      }
      const customer = await prisma.user.findUnique({
         where: {
            id: lease.customerId
         }
      });
      if(!customer){
         return error(500, 'Customer not found');
      }
      const address = await prisma.address.findUnique({
         where: {
            addressId: lease.addressId
         }
      });
      if(!address){
         return error(500, 'Address not found');
      }
      const employee = await prisma.user.findUnique({
         where: {
            id: event.locals.user.id
         }
      });
      if(!employee){
         return error(500, 'Employee not found');
      }
      const variables = getPacketVariables( customer, lease, unit, employee, address);
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
         await inngest.send({name:'depositPaid', data: { leaseId: lease.leaseId }})
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