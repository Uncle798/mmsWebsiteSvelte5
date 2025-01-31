<script lang='ts'>
	import type { PaymentRecord } from "@prisma/client";
	import dayjs from "dayjs";


   interface Props {
      paymentRecord:PaymentRecord
   }
   let { paymentRecord }:Props =$props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class=" m-4 w-1/3 flex-none">
   <p>Payment record number: <a href="/paymentRecords/{paymentRecord.paymentNumber}">{paymentRecord.paymentNumber}</a></p>
   <p>Payment amount: {currencyFormatter.format(paymentRecord.paymentAmount)}</p>
   <p>Payment created: {dayjs(paymentRecord.paymentCreated).format('M/D/YYYY')}</p>
   {#if paymentRecord.paymentCompleted}
   <p>Payment completed: { dayjs(paymentRecord.paymentCompleted).format('M/D/YYYY')}</p>
   {:else}
      Payment not completed
   {/if}
   <p>Payment type: {paymentRecord.paymentType.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}</p>
   {#if paymentRecord.invoiceNum}
      <p>Payment notes: <a href="/invoices/{paymentRecord.invoiceNum}">{paymentRecord.paymentNotes}</a></p>
      {:else}
      <p>Payment notes: {paymentRecord.paymentNotes}</p>
   {/if}
   {#if paymentRecord.deposit}
      Deposit
   {/if}
   {#if paymentRecord.refunded}
      <p>Refunded</p>
   {/if}
</div>