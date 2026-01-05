import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { faker } from '@faker-js/faker'
import { createLease } from '$lib/server/anvil';
import type { Address, Lease, User } from '../../../../generated/prisma/client';
import type { ResponseError, NodeError, } from '@anvilco/anvil';
import dayjs from 'dayjs';

export const load:PageServerLoad = (async (event) => {
   if(!event.locals.user?.admin){
      redirect(302, '/login?toast=admin');
   }
   let customer = await prisma.user.findUnique({
      where: {
         email: 'fakeCustomer@veryFakeEmail.com'
      }
   });
   let address:Address | null = null;
   let alternateContact:User | null = null;
   let alternateAddress:Address | null = null;
   let lease:Lease | null = null;
   if(!customer){
      customer = await prisma.user.create({
         data: {
            givenName: faker.person.firstName(),
            familyName: faker.person.lastName(),
            email: `fakeCustomer@veryFakeEmail.com`,
         }
      });
      if(Math.floor((Math.random()*100))%2 === 0){
         address = await prisma.address.create({
            data: {
               address1: faker.location.streetAddress(),
               address2: faker.location.secondaryAddress(),
               city: faker.location.city(),
               state: faker.location.state({abbreviated: true}),
               postalCode: faker.location.zipCode(),
               phoneNum1: faker.phone.number(),
               userId: customer.id,
            }
         })
      } else {
         address = await prisma.address.create({
            data: {
               address1: faker.location.streetAddress(),
               city: faker.location.city(),
               state: faker.location.state({abbreviated: true}),
               postalCode: faker.location.zipCode(),
               phoneNum1: faker.phone.number(),
               userId: customer.id
            }
         });
      }
      lease = await prisma.lease.create({
         data: {
            price: 135,
            unitNum: '324',
            customerId: customer.id,
            employeeId: event.locals.user.id,
            addressId: address!.addressId,
            leaseEffectiveDate: dayjs().set('date', 29).toDate(),
         }
      });
      alternateContact = await prisma.user.create({
         data: {
            givenName: faker.person.firstName(),
            familyName: faker.person.lastName(),
            email: 'fakeAltContact@veryFakeEmail.com',
         }
      });
      await prisma.leaseAlternativeContacts.create({
         data: {
            leaseId: lease.leaseId,
            userId: alternateContact.id
         }
      })
      if((Math.random()*100)%2 === 0){
         alternateAddress = await prisma.address.create({
            data: {
               userId: alternateContact.id,
               address1: faker.location.streetAddress(),
               address2: faker.location.secondaryAddress(),
               city: faker.location.city(),
               state: faker.location.state({abbreviated: true}),
               postalCode: faker.location.zipCode(),
               phoneNum1: faker.phone.number(),
            }
         })
      } else {
         alternateAddress = await prisma.address.create({
            data: {
               phoneNum1: faker.phone.number(),
               userId: alternateContact.id,
            }
         });
      }
   } else {
      address = await prisma.address.findFirst({
         where: {
            userId: customer.id,
         }
      });
      alternateContact = await prisma.user.findUnique({
         where: {
            email: 'fakeAltContact@veryFakeEmail.com'
         }
      });
      alternateAddress = await prisma.address.findFirst({
         where: {
            userId: alternateContact?.id,
         }
      });
      lease = await prisma.lease.findFirst({
         where: {
            customerId: customer.id
         }
      })
   }
   const unit = await prisma.unit.findUnique({
      where: {
         num: lease?.unitNum
      }
   });

   const contract = await createLease(customer, lease!, unit!, event.locals.user, address!, alternateContact!, alternateAddress!, true) as  { url:string, errors: (ResponseError | NodeError)[] | undefined};
   if (contract.errors) {
      // Note: because of the nature of GraphQL, statusCode may be a 200 even when
      // there are errors.
      console.error('There were errors!')
      console.error(JSON.stringify(contract.errors, null, 2));
   } 
   return { contract, customer, address, lease, alternateAddress, alternateContact};
});

export const actions: Actions = {
   default: async (event) => {
      if(!event.locals.user?.admin){
         redirect(302, '/login?toast=admin');
      }
      const formData = await event.request.formData();
      if(formData){
         const fakeCustomer = await prisma.user.findUnique({
            where: {
               email: "fakeCustomer@veryFakeEmail.com"
            }
         });
         if(fakeCustomer){
            const lease = await prisma.lease.findFirst({
               where: {
                  customerId: fakeCustomer.id
               }
            });
            const fakeAltContact = await prisma.user.findFirst({
               where: {
                  leaseAlternativeContacts: {
                     some: {
                        leaseId: lease?.leaseId
                     }
                  }
               }
            });
            await prisma.leaseAlternativeContacts.deleteMany({
               where: {
                  userId: fakeAltContact?.id
               }
            });
            await prisma.lease.deleteMany({
               where: {
                  customerId: fakeCustomer?.id
               }
            });
            await prisma.address.deleteMany({
               where: {
                  userId: fakeAltContact?.id,
               }
            });
            await prisma.address.deleteMany({
               where: {
                  userId: fakeCustomer.id
               }
            });
            await prisma.user.delete({
               where: {
                  id: fakeAltContact?.id
               }
            });
            await prisma.user.delete({
               where: {
                  id: fakeCustomer.id,
               }
            })
         }
      }
   }
};