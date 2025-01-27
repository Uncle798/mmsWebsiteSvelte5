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
   <p>Lease ID:<a href="/leases/{invoice.leaseId}">{invoice.leaseId}</a></p>
   <p>{invoice.invoiceNotes}</p>
   {#if invoice.paymentRecordNum}
      <p><a href="/paymentRecords/{invoice.paymentRecordNum}" class="btn">Payment record num: {invoice.paymentRecordNum}</a></p>
      {:else}
      <p><a href="/paymentRecords/new?defaultCustomer={invoice.customerId}&defaultInvoice={invoice.invoiceNum}" class="btn">Make a payment record for this lease</a></p>
   {/if}
   {#if invoice.deposit}
      Deposit
   {/if}
</div>