import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { onboardingExistingLeaseSchema } from '$lib/formSchemas/onboardingExistingLeaseSchema';
import { registerFormSchema } from '$lib/formSchemas/registerFormSchema';
import { addressFormSchema } from '$lib/formSchemas/addressFormSchema';
import type { Address, User, Lease } from '@prisma/client';

export const load = (async (event) => {
   const userId = event.url.searchParams.get('userId');
   const addressId = event.url.searchParams.get('addressId');
   const leaseId = event.url.searchParams.get('leaseId');
   const units = await prisma.unit.findMany({
      where: {
         AND: [
            { lease: {
               none: {
                  leaseEnded: null
               }
            }},
            { size: {
               not: 'ours'
            }},
            { unavailable: false}
         ]
      },
      orderBy: {
         num: 'asc'
      }
   })
   let customer:User | null = null;
   if(userId){
      customer = await prisma.user.findUnique({
         where: {
            id: userId
         }
      })
   }
   let address:Address | null = null;
   if(addressId){
      address = await prisma.address.findUnique({
         where: {
            addressId
         }
      })
   }
   let lease:Lease | null = null;
   if(leaseId){
      lease = await prisma.lease.findUnique({
         where: {
            leaseId
         }
      })
   }
   const registerForm = await superValidate(valibot(registerFormSchema));
   const addressForm = await superValidate(valibot(addressFormSchema));
   const onboardingExistingLeaseForm = await superValidate(valibot(onboardingExistingLeaseSchema));
   return { units, customer, address, lease, registerForm, addressForm, onboardingExistingLeaseForm};
}) satisfies PageServerLoad;