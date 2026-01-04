import { prisma } from '$lib/server/prisma';
import { createLease, } from '$lib/server/anvil';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { GraphQLResponse } from '@anvilco/anvil';

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
      });
      if(!customer){
         throw error(500, 'Customer not found');
      }
      if(lease.anvilEID){
         return { customer, lease}
      }
      const unit = await prisma.unit.findUnique({
         where:{
            num: lease?.unitNum,
         }
      });
      if(!unit){
         throw error(500, {message: 'Unit not found'});
      }
      const employee = await prisma.user.findFirst({
         where: {
            AND:[
               {admin:true},
            ]
         }
      });
      if(!employee){
         throw error(500, {message: 'Employee not found'})
      }
      const address = await prisma.address.findUnique({
         where: {
            addressId: lease?.addressId
         }
      });
      if(!address){
         error(500, {message: 'Address not found'})
      }
      const alternativeContact = await prisma.user.findFirst({
         where: {
            AND: [
               {
                  alternative: true,
                  leaseAlternativeContacts: {
                     some: {
                        lease: {
                           leaseId: lease.leaseId
                        }
                     }
                  }
               }
            ]
         }
      });
      const alternateAddress = await prisma.address.findFirst({
         where: {
            userId: alternativeContact?.id
         }
      })
      const { data, errors } = await createLease(customer, lease, unit, employee, address, alternativeContact, alternateAddress) as GraphQLResponse;
      if (errors) {
         // Note: because of the nature of GraphQL, statusCode may be a 200 even when
         // there are errors.
         console.error('There were errors!')
         console.error(JSON.stringify(errors, null, 2));
         console.error(data?.data['createEtchPacket'])
      } else {
         console.log(data)
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
         const invoice = await prisma.invoice.findFirst({
            where: {
               leaseId: lease.leaseId
            }
         })
         const paymentRecord = await prisma.paymentRecord.findFirst({
            where: {
               invoiceNum: invoice?.invoiceNum
            }
         })
         return { packetDetails, customer, paymentRecord };
      }
      return {};
   }
   return { };
 });