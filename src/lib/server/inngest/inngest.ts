import { Inngest } from 'inngest';
import { prisma } from '../prisma';
import { schemas } from './types';

export const inngest = new Inngest({id: 'ministorageManagementSoftware', schemas});


const unitUnavailableWhileRenting = inngest.createFunction({id: 'setUnitUnavailableWhileRenting'}, {event: 'leaseProcessStarted'}, async({event, step}) => {
   const unit = await step.run('getUnit', async () => {
      return prisma.unit.findFirstOrThrow({
         where: {
            num: event.data.unitNum
         }
      })
   })
   if(unit){
      await step.run('setUnitUnavailable', async () => {
         prisma.unit.update({
            where: {
               num: unit.num
            },
            data: {
               unavailable: true,
               notes: 'Being rented'
            }
         })
         return;
      })
      const event = await step.waitForEvent('waitForLeaseFinalized', {event: 'leaseFinalized', timeout: '15m'});
      if(event?.data.leaseId){         
         await step.run('setUnitAvailable', async () => {
            await prisma.unit.update({
               where: {
                  num: unit.num,
               },
               data: {
                  unavailable: false,
                  notes: undefined
               }
            })
            return;
         })
      }
   }
   return { message: 'Unit not found' }
})

export const functions = [
   unitUnavailableWhileRenting
]