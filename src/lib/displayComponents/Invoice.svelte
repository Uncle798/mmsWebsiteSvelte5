<script lang="ts">
   import type { Invoice } from "@prisma/client";
   import dayjs from "dayjs";
   interface Props {
      invoice:Invoice;
   }
   let { invoice }:Props = $props();
</script>

<div class="card p-4">
   <p><a href="/invoices/{invoice.invoiceNum}">Invoice Num: {invoice.invoiceNum}</a></p>
   <p>${invoice.invoiceAmount}</p>
   <p>Created: {dayjs(invoice.invoiceCreated).format('M/D/YYYY')}</p>
   <p>{invoice.invoiceNotes}</p>
   {#if invoice.paymentRecordNum}
      <p><a href="/paymentRecords/{invoice.paymentRecordNum}">Payment record num: {invoice.paymentRecordNum}</a></p>
   {/if}
</div>