<script lang='ts'>
	import type { PaymentRecord } from "@prisma/client";
	import dayjs from "dayjs";
	import HorizontalDivider from "./HorizontalDivider.svelte";


   interface Props {
      paymentRecord:PaymentRecord
      classes?: string
   }
   let { paymentRecord, classes }:Props =$props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class="{classes} grid grid-cols-2 gap-x-2 ">
   <div class="col-span-2 text-center text-sm font-semibold">Payment Record</div>
   <div class="text-right">Number</div> 
   <div class=""><a href="/paymentRecords/{paymentRecord.paymentNumber}" class="font-medium text-right anchor">{paymentRecord.paymentNumber}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Amount</div> 
   <div class="font-medium">{currencyFormatter.format(paymentRecord.paymentAmount)}</div>
   <HorizontalDivider classes='col-span-2' />
   <div class="text-right">Created</div>
   <div class="font-medium">{dayjs(paymentRecord.paymentCreated).format('M/D/YYYY')}</div>
   <HorizontalDivider classes='col-span-2' />
   {#if paymentRecord.paymentCompleted && paymentRecord.paymentCompleted.getDate() !== paymentRecord.paymentCreated.getDate()}
      <div class="text-right">Completed</div>
      <div class="font-medium">{ dayjs(paymentRecord.paymentCompleted).format('M/D/YYYY')}</div>
      <HorizontalDivider classes='col-span-2' />
   {:else if !paymentRecord.paymentCompleted}
      <div class="col-span-2 text-center">Payment not completed</div>
      <HorizontalDivider classes='col-span-2' />
   {/if}
   <div class="text-right">Type</div>
   <div class="font-medium">{paymentRecord.paymentType.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}</div>
   <HorizontalDivider classes='col-span-2' />
   {#if paymentRecord.invoiceNum}
      <div class="text-right">Notes</div>
      <div class="text-left font-medium"> <a href="/invoices/{paymentRecord.invoiceNum}" class="anchor">{paymentRecord.paymentNotes}</a></div>
   {:else}
      <div class="text-right">Notes</div>
      <div class="text-left font-medium">{paymentRecord.paymentNotes}</div>
   {/if}
   {#if paymentRecord.deposit}
      <HorizontalDivider classes='col-span-2' />
      <div class="col-span-2 text-center px-2 font-medium">Deposit</div>
   {/if}
   {#if paymentRecord.refunded}
      <HorizontalDivider classes='col-span-2' />
      <div class="col-span-2 text-center px-2 font-medium">Refunded</div>
   {/if}
</div>