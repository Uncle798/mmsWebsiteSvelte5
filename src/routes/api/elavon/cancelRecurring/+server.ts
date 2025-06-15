import { prisma } from '$lib/server/prisma';
import { CONVERGE_ACCOUNT_ID, CONVERGE_SSL_PIN, CONVERGE_USER_ID } from '$env/static/private';
import * as xmlJs from 'xml-js'
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
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
      const xml = 'xmldata=\n' +'<txn>\n'+ xmlJs.js2xml(details, {compact: true, ignoreComment: true, spaces: 4, ignoreDoctype: false}) + '\n</txn>';
      const response = await fetch('https://api.demo.convergepay.com/VirtualMerchantDemo/processxml.do', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         }, 
         body:xml
      })
      const responseBody = await response.text();
      const responseJson = xmlJs.xml2js(responseBody,{compact: true, ignoreDeclaration: true});
      //@ts-ignore
      if(responseJson.txn.ssl_result_message === 'SUCCESS'){
         await prisma.lease.update({
            where: {
               leaseId: lease.leaseId
            },
            data: {
               subscriptionId: null
            }
         })
      }
      return new Response(JSON.stringify(responseBody), {status: 200})
   }
   return new Response(JSON.stringify('leaseId not provided'), {status: 400});
};