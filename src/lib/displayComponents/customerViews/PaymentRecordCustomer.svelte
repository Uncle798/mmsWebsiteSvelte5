<script lang='ts'>
	import type { PaymentRecord } from '../../../generated/prisma/browser';
   import { currencyFormatter } from "$lib/utils/currencyFormatter";
	import dayjs from "dayjs";
	import HorizontalDivider from "../HorizontalDivider.svelte";


   interface Props {
      paymentRecord:PaymentRecord
      classes?: string
   }
   let { paymentRecord, classes }:Props =$props();
</script>

<div class="{classes} grid grid-cols-2 gap-x-2 ">
   <div class="col-span-2 text-center text-sm font-semibold">Payment Record</div>
   <div class="text-right">Number</div> 
   <div class="font-medium"><a href="/paymentRecords/{paymentRecord.paymentNumber}" class="anchor">{paymentRecord.paymentNumber}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Amount</div> 
   <div class="font-medium">{currencyFormatter(paymentRecord.paymentAmount)}</div>
   <HorizontalDivider classes='col-span-2' />
   <div class="text-right">Created</div>
   <div class="font-medium">{dayjs(paymentRecord.paymentCreated).format('M/D/YYYY')}</div>
   <HorizontalDivider classes='col-span-2' />

   <div class="text-right">Type</div>
   <div class="font-medium">{paymentRecord.paymentType.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}</div>
   <HorizontalDivider classes='col-span-2' />
   {#if paymentRecord.invoiceNum}
      <div class="text-right">Notes</div>
      <div class="font-medium"> <a class="anchor" href="/invoices/{paymentRecord.invoiceNum}">{paymentRecord.paymentNotes}</a></div>
   {:else}
      <div class="text-right">Notes</div>
      <div class="font-medium">{paymentRecord.paymentNotes}</div>
   {/if}
   {#if paymentRecord.payee}
      <HorizontalDivider classes='col-span-2' />
      <div class="text-right">Payee: </div>
      <div class="font-medium">{paymentRecord.payee}</div>
   {/if}
   {#if paymentRecord.deposit}
      <HorizontalDivider classes='col-span-2' />
      <div class="col-span-2 text-center font-medium">Deposit</div>
   {/if}
   {#if paymentRecord.refundedAmount > 0}
      <HorizontalDivider classes='col-span-2' />
            <div class="text-right">Amount Refunded</div>
      <div class="font-medium"> <a class="anchor" href="/invoices/{paymentRecord.invoiceNum}">{paymentRecord.refundedAmount}</a></div>
   {/if}
</div>