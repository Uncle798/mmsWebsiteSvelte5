import { prisma } from '$lib/server/prisma';
import { anvilClient, getOrganizationalPacketVariables, getPersonalPacketVariables } from '$lib/server/anvil';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user){
      redirect(302, '/login?toast=unauthorized')
   }
   const invoiceNum = event.url.searchParams.get('invoiceNum');
   if(invoiceNum){
      const invoice = await prisma.invoice.findFirst({
         where: {
            invoiceNum:parseInt(invoiceNum, 10),
         }
      })
      if(!invoice){
         return fail(404, { message: "Invoice not found"});
      }
      const paymentRecord = await prisma.paymentRecord.create({
         data: {
            paymentAmount: invoice.invoiceAmount,
            invoiceNum: invoice.invoiceNum,
            customerId: invoice.customerId || '',
            paymentType: 'STRIPE'
         }
      })
      await prisma.invoice.update({
         where: {
            invoiceNum: invoice.invoiceNum
         },
         data: {
            paymentRecordNum: paymentRecord.paymentNumber
         }
      })
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId: invoice?.leaseId || '',
         }
      })
      const customer = await prisma.user.findUnique({
         where:{
            id: invoice?.customerId || undefined,
         }
      })
      const unit = await prisma.unit.findUnique({
         where:{
            num: lease?.unitNum,
         }
      });
      const employee = await prisma.user.findFirst({
         where: {
            admin:true
         }
      })
      if(lease?.anvilEID){
         return {}
      }
      let variables ={};
      if(customer?.organizationName){
         variables = getOrganizationalPacketVariables( customer!, lease!, unit!, employee! );
      } else {
         variables = getPersonalPacketVariables( customer!, lease!, unit!, employee! );
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
         console.log('Visit the new packet on your dashboard:', packetDetails.detailsURL)
         const anvilEID = packetDetails['eid']
      await prisma.lease.update({
            where: {
               leaseId: lease?.leaseId
            },
            data: {
               anvilEID 
            }
         })
         return {packetDetails};
      }
   }
 });