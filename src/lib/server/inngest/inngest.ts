import { Inngest } from 'inngest';
import { prisma } from '../prisma';
import { schemas } from './types';

export const inngest = new Inngest({id: 'ministorageManagementSoftware', schemas});

const unitUnavailableWhileRenting = inngest.createFunction({id: 'setUnitUnavailableWhileRenting'}, {event: 'leaseCreated'}, async({event, step}) => {
   const lease = await step.run('getLease', async () => {
      const lease = await prisma.lease.findFirstOrThrow({
         where: {
            leaseId: event.data.leaseId
         }
      })
      return lease;
   })
   if(lease){
      await step.run('setUnitUnavailable', async () => {
         prisma.unit.update({
            where: {
               num: lease.unitNum
            },
            data: {
               unavailable: true,
            }
         })
         return;
      })
      const event = await step.waitForEvent('waitForLeaseFinalized', {event: 'depositPaid', timeout: '15m'});
      if(event?.data.leaseId === lease.leaseId){         
         await step.run('setUnitAvailable', async () => {
            await prisma.unit.update({
               where: {
                  num: lease.unitNum,
               },
               data: {
                  unavailable: false,
                  notes: undefined
               }
            })
            return;
         })
      } else if (event === null){
         await step.run('setUnitAvailable', async () => {
            await prisma.unit.update({
               where: {
                  num: lease.unitNum,
               },
               data: {
                  unavailable: false,
               }
            })
         })
         await step.run('deleteLease', async () => {
            await prisma.lease.delete({
               where: {
                  leaseId: lease.leaseId
               }
            })
         })
         return;
      }
      return { message: `leaseId doesn't match`}
   }
   return { message: 'Unit not found' }
})

export const functions = [
   unitUnavailableWhileRenting
]