<script lang="ts">
   import type { Invoice } from "@prisma/client";
   import dayjs from "dayjs";
	import HorizontalDivider from "./HorizontalDivider.svelte";
   interface Props {
      invoice:Invoice;
      classes?: string;
   }
   let { invoice, classes }:Props = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
</script>

<div class="grid grid-cols-2 gap-x-2 {classes}">
   <div class='text-right'>Invoice number:</div> 
   <div class="font-medium"><a href="/invoices/{invoice.invoiceNum}">{invoice.invoiceNum}</a></div>
   <HorizontalDivider classes='col-span-2' />
   <div class='text-right'>Invoice amount:</div>
   <div class="font-medium ">{currencyFormatter.format(invoice.invoiceAmount)}</div>
   <HorizontalDivider classes='col-span-2' />
   <div class='text-right'>Created:</div> 
   <div class="font-medium">{dayjs(invoice.invoiceCreated).format('M/D/YYYY')}</div>
   <HorizontalDivider classes='col-span-2' />
   <div class='text-right'>Lease ID:</div> 
   <div class="truncate font-medium"><a href="/leases/{invoice.leaseId}">{invoice.leaseId}</a></div>
   <HorizontalDivider classes='col-span-2' />
   <div class="text-right">Invoice notes:</div> 
   <div class="pl-4 -indent-4 pr-4 font-medium">{invoice.invoiceNotes}</div>
   <HorizontalDivider classes='col-span-2' />
   {#if invoice.paymentRecordNum}
      <div class='text-right'>Payment record num:</div> 
      <div class="font-medium"><a href="/paymentRecords/{invoice.paymentRecordNum}" class="">{invoice.paymentRecordNum}</a></div>
   {:else}
      <div class='col-span-2 m-2'><a href="/paymentRecords/new?defaultCustomer={invoice.customerId}&defaultInvoice={invoice.invoiceNum}" class="btn preset-filled-primary-50-950 rounded-lg self-center">Make a payment record for this lease</a></div>
   {/if}
   {#if invoice.deposit}
      <div class="col-span-2 font-medium text-center">Deposit</div>
   {/if}
</div>