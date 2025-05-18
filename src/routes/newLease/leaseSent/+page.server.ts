import { prisma } from '$lib/server/prisma';
import { anvilClient, getOrganizationalPacketVariables, getPersonalPacketVariables } from '$lib/server/anvil';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { qStash } from '$lib/server/qStash';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const leaseId = event.url.searchParams.get('leaseId');
   if(leaseId){
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: leaseId,
         }
      })
      if(!lease){
         return {}
      }
      const customer = await prisma.user.findUnique({
         where:{
            id: lease.customerId!,
         }
      })
      if(lease.anvilEID){
         return { customer, lease}
      }
      const unit = await prisma.unit.findUnique({
         where:{
            num: lease?.unitNum,
         }
      });
      const employee = await prisma.user.findFirst({
         where: {
            AND:[
               {admin:true},
               {familyName: 'Branson'}
            ]
         }
      })
      const address = await prisma.address.findUnique({
         where: {
            addressId: lease?.addressId
         }
      });
      if(!address){
         fail(400)
      }
      let variables ={};
      if(customer?.organizationName){
         variables = getOrganizationalPacketVariables( customer!, lease!, unit!, employee!, address! );
      } else {
         variables = getPersonalPacketVariables( customer!, lease!, unit!, employee!, address!);
      }
      const { data, errors } = await anvilClient.createEtchPacket({
         variables
      })
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
         await qStash.notify({eventId:lease.leaseId});
         const paymentRecord = await prisma.paymentRecord.findFirst({
            where: {
               invoice: {
                  leaseId: lease.leaseId
               }
            }
         })
         return { packetDetails, customer, paymentRecord };
      }
      return {};
   }
   return { };
 });