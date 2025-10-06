import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { addressFormSchema, emailVerificationFormSchema, newInvoiceFormSchema, registerFormSchema } from '$lib/formSchemas/schemas';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { Address } from '@prisma/client';

export const load = (async (event) => {
   if(!event.locals.user?.employee){
      redirect(302, '/login?toast=employee')
   }
   const newInvoiceForm = await superValidate(valibot(newInvoiceFormSchema));
   const registerForm = await superValidate(valibot(registerFormSchema));
   const emailVerificationForm = await superValidate(valibot(emailVerificationFormSchema));
   const addressForm = await superValidate(valibot(addressFormSchema));
   const userId = event.url.searchParams.get('userId');
   const leaseId = event.url.searchParams.get('leaseId');
   if(userId && leaseId){
      const customer = await prisma.user.findUnique({
         where: {
            id: userId
         }
      });
      try {         
         const lease = await prisma.lease.findUniqueOrThrow({
            where: {
               leaseId
            }
         });
         if(customer){
            const address = await prisma.address.findFirst({
               where: {
                  AND: [
                     {userId: customer.id},
                     {softDelete: false},
                  ]
               }
            })
            return { newInvoiceForm, registerForm, emailVerificationForm, addressForm, customer, lease, address}
         }
      } catch (error) {
         console.error(error)
         return { newInvoiceForm, registerForm, emailVerificationForm, addressForm, customer}

      }
   }
   if(leaseId){
      try{
         const lease = await prisma.lease.findUniqueOrThrow({
            where: {
               leaseId
            }
         });
         if(lease){
            const customer = await prisma.user.findFirstOrThrow({
               where: {
                  id: lease.customerId
               }
            });
            const address = await prisma.address.findFirstOrThrow({
               where: {
                  AND: [
                     {userId: customer?.id},
                     {softDelete: false}, 
                  ]
               }
            })
            return { lease, customer, address, newInvoiceForm, registerForm, emailVerificationForm, addressForm, }
         }
      } catch (error){
         console.error(error);
         return { newInvoiceForm, registerForm, emailVerificationForm, addressForm, }
      }
   }
   if(userId){
      const customer = await prisma.user.findUnique({
         where: {
            id: userId
         }
      })
      const address = await prisma.address.findFirst({
         where: {
            AND: [
               {userId: customer?.id},
               {softDelete: false}
            ]
         }
      })
      const leases = await prisma.lease.findMany({
         where: {
            AND: [
               {customerId: userId},
               {leaseEnded: null}
            ]
         },
         orderBy: {
            unitNum: 'asc'
         }
      });
      if(leases.length > 1){
         return { customer, leases, address, newInvoiceForm, registerForm, addressForm, emailVerificationForm }
      }
      const lease = leases[0];

      return { customer, lease, address, newInvoiceForm, registerForm, addressForm, emailVerificationForm }
   }
   const customers = await prisma.user.findMany({
      orderBy: {
         familyName: 'asc'
      },
      where: {
         archive: false
      }
   });
   const leases = await prisma.lease.findMany({
      where: {
         leaseEnded: null,
      },
      orderBy: {
         unitNum: 'asc'
      }
   })
   return { newInvoiceForm, customers, leases, registerForm, addressForm, emailVerificationForm };
}) satisfies PageServerLoad;
