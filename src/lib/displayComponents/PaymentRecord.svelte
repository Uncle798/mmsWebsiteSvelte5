<script lang='ts'>
	import type { PaymentRecord } from "@prisma/client";
	import dayjs from "dayjs";


   interface Props {
      paymentRecord:PaymentRecord
   }
   let { paymentRecord }:Props =$props();
</script>

<div class="card p-4">
   <p>Payment Record Number: {paymentRecord.paymentNumber}</p>
   <p>${paymentRecord.paymentAmount}</p>
   <p>Payment completed { dayjs(paymentRecord.paymentCompleted).format('M/D/YYYY')}</p>
   {#if paymentRecord.paymentNotes}
   <p><a href='/invoices/{paymentRecord.paymentNotes.replace(/[^$0-9]/gm, '')}'>{paymentRecord.paymentNotes}</a></p>
   {/if}
</div>