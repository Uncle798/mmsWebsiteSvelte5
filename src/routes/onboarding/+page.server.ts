import { prisma } from '$lib/server/prisma';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { onboardingExistingLeaseSchema } from '$lib/formSchemas/onboardingExistingLeaseSchema';
import { onboardingAddressFormSchema } from '$lib/formSchemas/onboardingAddressFormSchema';
import type { Address, User, Lease, PropertyWithLien } from '../../generated/prisma/client';
import { propertySubjectToLienSchema } from '$lib/formSchemas/propertySubjectToLienSchema';
import { alternativeContactFormSchema } from '$lib/formSchemas/alternativeContactFormSchema';
import { redirect } from '@sveltejs/kit';
import { onboardingRegisterFormSchema } from '$lib/formSchemas/onboardingRegisterFormSchema';

export const load = (async (event) => {
   if(!event.locals.user?.admin){
      redirect(302, '/login?toast=admin');
   }
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
   let address:Address | null = null;
   if(userId){
      customer = await prisma.user.findUnique({
         where: {
            id: userId
         }
      })
   }
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
   let alternativeContact:User | null = null; 
   let alternativeAddress:Address | null = null;
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
      if(lease?.alternativeContactId){
         alternativeContact = await prisma.user.findUnique({
            where: {
               id: lease?.alternativeContactId ? lease.alternativeContactId : undefined
            }
         })
      }
      if(alternativeContact){
         alternativeAddress = await prisma.address.findFirst({
            where: {
               AND: [
                  { 
                     userId: alternativeContact.id,
                  },
                  {
                     softDelete: false,
                  }
               ]
            }
         })
      }
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
   if(lien === 'true'){
      propertySubjectToLienForm = await superValidate(valibot(propertySubjectToLienSchema));
   }
   let customers:User[] = [];
   if(!userId){
      customers = await prisma.user.findMany({
         where: {
            AND: [
               {employee: false},
               {alternative: false},
            ]
         },
         orderBy: {
            familyName: 'asc'
         }
      })
   }
   let existingAddresses:Address[] = [];
   if(userId && !addressId){
      existingAddresses = await prisma.address.findMany({
         where: {
            userId
         }
      })
   }
   const registerForm = await superValidate(valibot(onboardingRegisterFormSchema));
   const addressForm = await superValidate(valibot(onboardingAddressFormSchema));
   const onboardingExistingLeaseForm = await superValidate(valibot(onboardingExistingLeaseSchema));
   return { 
      units, 
      customer, 
      address, 
      lease, 
      properties,
      lienHolderAddresses,
      lienHolderContacts,
      alternativeContact,
      alternativeAddress,
      customers,
      existingAddresses,
      registerForm, 
      addressForm, 
      onboardingExistingLeaseForm, 
      propertySubjectToLienForm,
      alternativeContactForm
   };
}) satisfies PageServerLoad;