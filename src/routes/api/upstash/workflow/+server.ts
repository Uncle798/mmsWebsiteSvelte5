import { serve } from '@upstash/workflow/svelte';
import { env } from '$env/dynamic/private';
import { prisma } from '$lib/server/prisma';

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
         })
         await context.waitForEvent('wait for lease sent or 15 min', leaseId, 15*60);
         await context.run("second-step", async () => {
            const lease = await prisma.lease.findUnique({
               where: {
                  leaseId
               }
            });
            await prisma.unit.update({
               where:{
                  num: lease?.unitNum,
               },
               data: {
                  unavailable: false
               }
            });
         });
      }
   },
   { 
      env,
   }
)