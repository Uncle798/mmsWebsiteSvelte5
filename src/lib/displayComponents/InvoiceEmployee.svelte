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

<div class="p-4 grid grid-cols-2 {classes}">
   <div class=''>Invoice number:</div> 
   <div class="font-medium"><a href="/invoices/{invoice.invoiceNum}">{invoice.invoiceNum}</a></div>
   <HorizontalDivider classes='col-span-2' />
   <div class=''>Invoice amount:</div>
   <div class="font-medium ">{currencyFormatter.format(invoice.invoiceAmount)}</div>
   <HorizontalDivider classes='col-span-2' />
   <div class=''>Created:</div> 
   <div class="font-medium">{dayjs(invoice.invoiceCreated).format('M/D/YYYY')}</div>
   <HorizontalDivider classes='col-span-2' />
   <div class=''>Lease ID:</div> 
   <div class="break-words font-medium"><a href="/leases/{invoice.leaseId}">{invoice.leaseId}</a></div>
   <HorizontalDivider classes='col-span-2' />
   <div class="">Invoice notes:</div> 
   <div class="pl-4 -indent-4 pr-4 font-medium">{invoice.invoiceNotes}</div>
   <HorizontalDivider classes='col-span-2' />
   {#if invoice.paymentRecordNum}
      <div class=''>Payment record num:</div> 
      <div class="font-medium"><a href="/paymentRecords/{invoice.paymentRecordNum}" class="">{invoice.paymentRecordNum}</a></div>
   {:else}
      <div class=''><a href="/paymentRecords/new?defaultCustomer={invoice.customerId}&defaultInvoice={invoice.invoiceNum}" class="btn preset-filled-primary-50-950">Make a payment record for this lease</a></div>
   {/if}
   {#if invoice.deposit}
      <div class="col-span-2 font-medium text-center">Deposit</div>
   {/if}
</div>