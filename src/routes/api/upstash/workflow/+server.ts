import { serve } from '@upstash/workflow/svelte';
import { env } from '$env/dynamic/private';
import { prisma } from '$lib/server/prisma';
import { stripe } from '$lib/server/stripe';

type InitialPayload = {
   leaseId: string
}

export const { POST } = serve<InitialPayload>(
   async (context) => {
      const payload = context.requestPayload
      const {leaseId} = payload
      if(leaseId){
         await context.run("1st step", async () => {
            const lease = await prisma.lease.findUnique({
               where:{
                  leaseId
               }
            })
            await prisma.unit.update({
               where: {
                  num: lease?.unitNum
               },
               data: {
                  unavailable: true
               }
            })
            console.log('upstash 1st step')
         })
         await context.waitForEvent('wait for lease sent or 15 min', leaseId, 15*60);
         await context.run("second-step", async () => {
            const lease = await prisma.lease.findUnique({
               where: {
                  leaseId
               }
            });
            if(lease){
               await prisma.unit.update({
                  where:{
                     num: lease.unitNum,
                  },
                  data: {
                     unavailable: false
                  }
               });
               const paymentRecords = await prisma.paymentRecord.findFirst({
                  where: {
                     invoice: {
                        leaseId: lease?.leaseId
                     }
                  }
               })
               if(paymentRecords){
                  console.log('upstash found a payment record and stopped');
                  return;
               } else {
                  await prisma.lease.delete({
                     where: {
                        leaseId: lease?.leaseId
                     }
                  })
                  console.log('upstash 2nd step')
               }
            }
         });
      }
   },
   { 
      env,
   }
)