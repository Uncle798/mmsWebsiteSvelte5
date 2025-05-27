import { CONVERGE_ACCOUNT_ID, CONVERGE_SSL_PIN, CONVERGE_USER_ID } from '$env/static/private';
import { prisma } from '$lib/server/prisma';
import dayjs from 'dayjs';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
   const body = await event.request.json();
   const { invoiceNum, subscription } = body;
   console.log(subscription)
   if(!invoiceNum){
      return new Response(JSON.stringify('invoice number not provided'), {status: 400});
   }
   const invoice = await prisma.invoice.findUnique({
      where: {
         invoiceNum
      }
   });
   if(!invoice){
      return new Response(JSON.stringify('Invoice not found'), {status: 404});
   }
   const customer = await prisma.user.findUnique({
      where: {
         id: invoice.customerId
      }
   })
   if(!customer){
      return new Response(JSON.stringify('Customer not found'), {status:404});
   }
   let details = {};
   if(subscription){
      details = {
         ssl_transaction_type: 'ccaddrecurring',
         ssl_account_id: CONVERGE_ACCOUNT_ID,
         ssl_user_id: CONVERGE_USER_ID,
         ssl_pin: CONVERGE_SSL_PIN,
         ssl_amount: invoice.invoiceAmount,
         ssl_invoice_number: invoice.invoiceNum,
         ssl_next_payment_date: dayjs(invoice.invoiceDue).format('MM/DD/YYYY'),
         ssl_billing_cycle: 'MONTHLY',
      }
   } else {
      details = {
        ssl_transaction_type: 'ccsale',
        ssl_account_id: CONVERGE_ACCOUNT_ID,
        ssl_user_id: CONVERGE_USER_ID,
        ssl_pin: CONVERGE_SSL_PIN,
        ssl_amount: invoice.invoiceAmount,
        ssl_invoice_number: invoice.invoiceNum,
     }
   }
   const formBody = Object.keys(details).map(key => {
      const string = encodeURIComponent(key) + '=' + 
         encodeURIComponent(details[key as keyof typeof details])
      return string
   }).join('&')
   console.log(formBody)
   const response = await fetch('https://api.demo.convergepay.com/hosted-payments/transaction_token', {
      method: 'POST', 
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
      }, 
      body: formBody.toString()
   })
   const responseBody = await response.text();
   return new Response(JSON.stringify(responseBody), {status:200});
};