<script lang="ts">
   import type { Invoice } from "@prisma/client";
   import dayjs from "dayjs";
   interface Props {
      invoice:Invoice;
      classes?: string;
   }
   let { invoice, classes }:Props = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class="m-4 flex-none {classes}">
   <p><a href="/invoices/{invoice.invoiceNum}"><span class="font-semibold">Invoice number:</span> {invoice.invoiceNum}</a></p>
   <p><span class="font-semibold">Invoice amount:</span> {currencyFormatter.format(invoice.invoiceAmount)}</p>
   <p><span class="font-semibold">Created:</span> {dayjs(invoice.invoiceCreated).format('M/D/YYYY')}</p>
   <p class="break-words"><span class="font-semibold">Lease ID:</span> <a href="/leases/{invoice.leaseId}">{invoice.leaseId}</a></p>
   <p class=""><span class="font-semibold">Invoice notes:</span> <span class="indent-8">{invoice.invoiceNotes}</span></p>
   {#if invoice.paymentRecordNum}
   <p><span class="font-semibold">Payment record num:</span> <a href="/paymentRecords/{invoice.paymentRecordNum}" class="">{invoice.paymentRecordNum}</a></p>
      {:else}
      <p><a href="/paymentRecords/new?defaultCustomer={invoice.customerId}&defaultInvoice={invoice.invoiceNum}" class="btn">Make a payment record for this lease</a></p>
   {/if}
   {#if invoice.deposit}
      Deposit
   {/if}
</div>