import { CONVERGE_ACCOUNT_ID, CONVERGE_SSL_PIN, CONVERGE_USER_ID } from '$env/static/private';
import { prisma } from '$lib/server/prisma';
import * as xmlJs from 'xml-js'
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
   if(!event.locals.user?.employee){
      return new Response(JSON.stringify('You must be an employee'), {status:401});
   }
   const body = await event.request.json()
   const { paymentNum } = body;
   if(paymentNum){
      const payment = await prisma.paymentRecord.findUnique({
         where: {
            paymentNumber:paymentNum
         }
      })
      if(!payment){
         return new Response(JSON.stringify('Payment not found'), {status: 404})
      }
      if(!payment.transactionId){
         return new Response(JSON.stringify('Payment wasn\'t made with a credit card'), {status: 400})
      }
      const details = {
         ssl_transaction_type: 'ccreturn',
         ssl_account_id: CONVERGE_ACCOUNT_ID,
         ssl_user_id: CONVERGE_USER_ID,
         ssl_pin: CONVERGE_SSL_PIN,
         ssl_txn_id: payment.transactionId
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
      console.log(responseJson);
      if(responseJson.elements.ssl_result === 0){
         console.log(responseJson.elements.ssl_txn_id)
         const refund = await prisma.refundRecord.create({
            data: {
               paymentRecordNum: payment.paymentNumber,
               refundAmount: payment.paymentAmount,
               refundType: 'CREDIT',
               customerId: payment.customerId,
               refundCompleted: new Date(),
               refundNotes: `Refund of payment ${payment.paymentNumber}, ${payment.paymentNotes}`
            }
         })
         await prisma.paymentRecord.update({
            where: {
               paymentNumber: payment.paymentNumber
            },
            data: {
               refundNumber: refund.refundNumber
            }
         })
         return new Response(JSON.stringify('Refund completed'), {status: 200})
      }
   }
   return new Response(JSON.stringify('Payment num not provided'), {status:400})
};