import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { superValidate, message } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import { alternativeContactFormSchema } from "$lib/formSchemas/alternativeContactFormSchema";
import { ratelimit } from "$lib/server/rateLimit";
import { prisma } from "$lib/server/prisma";

export const actions:Actions = {
   default: async (event) => {
      if(!event.locals.user){
         redirect(302, '/login?toast=unauthorized');
      }
      if(event.locals.user.employee){
         const formData = await event.request.formData();
         const alternativeContactForm = await superValidate(formData, valibot(alternativeContactFormSchema));
         console.log(alternativeContactForm)
         const { success, reset } = await ratelimit.employeeForm.limit(event.locals.user.id);
         if(!success) {
            const timeRemaining = Math.floor((reset - Date.now()) /1000);
			   return message(alternativeContactForm, `Please wait ${timeRemaining}s before trying again.`)
		   }
         if(!alternativeContactForm.valid){
            return message(alternativeContactForm, `Form not valid`);
         }
         const { data } = alternativeContactForm;
         const lease = await prisma.lease.findUnique({
            where: {
               leaseId: data.leaseId,
            }
         });
         if(!lease){
            return message(alternativeContactForm, `lease not found`);
         }
         let contact = await prisma.user.findUnique({
            where: {
               email: data.email
            }
         })
         if(!contact){
            contact = await prisma.user.create({
               data: {
                  givenName: data.givenName,
                  familyName: data.familyName,
                  email: data.email,
                  alternative: true,
               }
            });
         } else {
            contact = await prisma.user.update({
               where: {
                  id: contact.id,
               },
               data: {
                  alternative: true,
               }
            })
         }
         await prisma.address.create({
            data: {
               address1: data.address1,
               address2: data.address2,
               city: data.city,
               state: data.state,
               postalCode: data.postalCode,
               country: data.country,
               phoneNum1: data.phoneNum1,
               phoneNum1Country: data.phoneNum1Country,
               userId: contact.id
            }
         });
         await prisma.lease.update({
            where: {
               leaseId: lease.leaseId,
            },
            data: {
               alternativeContactId: contact.id
            }
         });
         const redirectTo = event.url.searchParams.get('redirectTo');
         const userId = event.url.searchParams.get('userId');
         const leaseId = event.url.searchParams.get('leaseId');
         const addressId = event.url.searchParams.get('addressId');
         if(redirectTo){
            redirect(302, `/${redirectTo}?userId=${userId}&leaseId=${leaseId}&addressId=${addressId}&contactId=`)
         }
      }
   }
}