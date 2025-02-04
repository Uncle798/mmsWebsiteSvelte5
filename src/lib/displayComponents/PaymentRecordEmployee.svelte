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

<div class="p-2  {classes} grid grid-cols-2 min-w-80 ">
   <div class="text-left">Payment record number:</div> 
   <div class="text-left px-2"><a href="/paymentRecords/{paymentRecord.paymentNumber}" class="font-semibold text-right">{paymentRecord.paymentNumber}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div>Payment amount:</div> 
   <div class="text-left px-2 font-semibold">{currencyFormatter.format(paymentRecord.paymentAmount)}</div>
   <HorizontalDivider classes='col-span-2' />
   <div>Payment created:</div>
   <div class="text-left px-2 font-semibold">{dayjs(paymentRecord.paymentCreated).format('M/D/YYYY')}</div>
   <HorizontalDivider classes='col-span-2' />
   {#if paymentRecord.paymentCompleted && paymentRecord.paymentCompleted.getDate() !== paymentRecord.paymentCreated.getDate()}
   <div>Payment completed:</div>
   <div class="text-left px-2 font-semibold">{ dayjs(paymentRecord.paymentCompleted).format('M/D/YYYY')}</div>
   {:else if !paymentRecord.paymentCompleted}
   <div class="col-span-2">Payment not completed</div>
   {/if}
   <HorizontalDivider classes='col-span-2' />
   <div>Payment type:</div>
   <div class="text-left px-2 font-semibold">{paymentRecord.paymentType.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}</div>
   <HorizontalDivider classes='col-span-2' />
   {#if paymentRecord.invoiceNum}
   <div>Payment notes:</div>
   <div class="text-left pl-6 pr-2 -indent-4 font-semibold"> <a href="/invoices/{paymentRecord.invoiceNum}">{paymentRecord.paymentNotes}</a></div>
   {:else}
   <div class="">Payment notes: </div>
   <div class="text-left pl-6 pr-2 -indent-4 font-semibold">{paymentRecord.paymentNotes}</div>
   {/if}
   <HorizontalDivider classes='col-span-2' />
   {#if paymentRecord.deposit}
   <div class="col-span-2 text-center px-2 font-semibold">Deposit</div>
   {/if}
   <HorizontalDivider classes='col-span-2' />
   {#if paymentRecord.refunded}
      <div class="col-span-2 text-center px-2 font-semibold">Refunded</div>
   {/if}
</div>