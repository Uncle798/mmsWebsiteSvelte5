<script lang='ts'>
	import type { PaymentRecord } from "@prisma/client";
	import dayjs from "dayjs";


   interface Props {
      paymentRecord:PaymentRecord
   }
   let { paymentRecord }:Props =$props();
</script>

<div class="card p-4">
   <p>Payment Record Number: <a href="/paymentRecords/{paymentRecord.paymentNumber}">{paymentRecord.paymentNumber}</a></p>
   <p>${paymentRecord.paymentAmount}</p>
   {#if paymentRecord.paymentCompleted}
   <p>Payment completed { dayjs(paymentRecord.paymentCompleted).format('M/D/YYYY')}</p>
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