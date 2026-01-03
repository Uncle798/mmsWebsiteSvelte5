import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { faker } from '@faker-js/faker'
import { createLease } from '$lib/server/anvil';
import type { Address, User } from '../../../../generated/prisma/client';
import type { ResponseError, NodeError, } from '@anvilco/anvil';

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
   if(!customer){
      customer = await prisma.user.create({
         data: {
            givenName: `Fake`,
            familyName: `Customer`,
            email: `fakeCustomer@veryFakeEmail.com`,
         }
      });
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
      alternateContact = await prisma.user.create({
         data: {
            givenName: 'FakeAlt',
            familyName: 'Contact',
            email: 'fakeAltContact@veryFakeEmail.com',
         }
      });
      alternateAddress = await prisma.address.create({
         data: {
            phoneNum1: faker.phone.number(),
            userId: alternateContact.id,
         }
      });
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
      })
   }
   const lease = await prisma.lease.create({
      data: {
         price: 35,
         unitNum: '001',
         customerId: customer.id,
         employeeId: event.locals.user.id,
         addressId: address!.addressId,
         leaseEffectiveDate: new Date(),
      }
   });
   const unit = await prisma.unit.findUnique({
      where: {
         num: '001'
      }
   });

   const contract = await createLease(customer, lease, unit!, event.locals.user, address!, alternateContact!, alternateAddress!, true) as  { url:string, errors: (ResponseError | NodeError)[] | undefined};
   console.log(contract);
   if (contract.errors) {
      // Note: because of the nature of GraphQL, statusCode may be a 200 even when
      // there are errors.
      console.error('There were errors!')
      console.error(JSON.stringify(contract.errors, null, 2));
   } 
   return { contract, customer, address, lease, };
});