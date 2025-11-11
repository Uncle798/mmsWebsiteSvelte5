import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { onboardingExistingLeaseSchema } from '$lib/formSchemas/onboardingExistingLeaseSchema';
import { registerFormSchema } from '$lib/formSchemas/registerFormSchema';
import { addressFormSchema } from '$lib/formSchemas/addressFormSchema';
import type { Address, User, Lease, PropertyWithLien } from '@prisma/client';
import { propertySubjectToLienSchema } from '$lib/formSchemas/propertySubjectToLienSchema';
import { alternativeContactFormSchema } from '$lib/formSchemas/alternativeContactFormSchema';

export const load = (async (event) => {
   const userId = event.url.searchParams.get('userId');
   const addressId = event.url.searchParams.get('addressId');
   const leaseId = event.url.searchParams.get('leaseId');
   const lien = event.url.searchParams.get('lien');
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
   let properties:PropertyWithLien[] | null = null;
   let lienHolderAddresses:Address[] = [];
   const lienHolderContacts:User[] = [];
   if(leaseId){
      lease = await prisma.lease.findUnique({
         where: {
            leaseId
         }
      })
      properties = await prisma.propertyWithLien.findMany({
         where: {
         leaseId,
         },
      });
      if(properties){
         for(const property of properties){
            const address = await prisma.address.findUnique({
               where: {
                  addressId: property.addressId
               }
            })
            if(address){
               lienHolderAddresses.push(address)
            }
            const contact = await prisma.user.findUnique({
               where: {
                  id: property.userId
               }
            })
            if(contact){
               lienHolderContacts.push(contact)
            }
         }
      }
   }
   const alternativeContactForm = await superValidate(valibot(alternativeContactFormSchema));
   let propertySubjectToLienForm = null;
   console.log(lien);
   if(lien === 'true'){
      propertySubjectToLienForm = await superValidate(valibot(propertySubjectToLienSchema));
   }
   const registerForm = await superValidate(valibot(registerFormSchema));
   const addressForm = await superValidate(valibot(addressFormSchema));
   const onboardingExistingLeaseForm = await superValidate(valibot(onboardingExistingLeaseSchema));
   return { 
      units, 
      customer, 
      address, 
      lease, 
      properties,
      lienHolderAddresses,
      lienHolderContacts,
      registerForm, 
      addressForm, 
      onboardingExistingLeaseForm, 
      propertySubjectToLienForm,
      alternativeContactForm
   };
}) satisfies PageServerLoad;