import { prisma } from '$lib/server/prisma';
import { CONVERGE_ACCOUNT_ID, CONVERGE_SSL_PIN, CONVERGE_USER_ID } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
   const body = await event.request.json();
   const { leaseId } = body;
   if(leaseId){
      const lease = await prisma.lease.findUnique({
         where: {
            leaseId
         }
      });
      if(!lease){
         return new Response(JSON.stringify('Lease not found'), {status: 404});
      }
      if(!lease.subscriptionId){
         return new Response(JSON.stringify('Lease not on auto pay'), {status:400});
      }
      const details = {
         ssl_transaction_type: 'ccdeleterecurring',
         ssl_account_id: CONVERGE_ACCOUNT_ID,
         ssl_user_id: CONVERGE_USER_ID,
         ssl_pin: CONVERGE_SSL_PIN,
         ssl_recurring_id: lease.subscriptionId
      }
      const formBody = Object.keys(details).map(key => {
         const string = encodeURIComponent(key) + '=' + encodeURIComponent(details[key as keyof typeof details])
         return string;
      }).join('&')
      const response = await fetch('https://api.demo.convergepay.com/VirtualMerchantDemo/processxml.do', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         }, 
         body: formBody
      })
      const responseBody = response.text();
      console.log(responseBody);
      return new Response(JSON.stringify(responseBody), {status: 200})
   }
   return new Response(JSON.stringify('leaseId not provided'), {status: 400});
};