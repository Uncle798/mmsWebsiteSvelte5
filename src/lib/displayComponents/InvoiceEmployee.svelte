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
   <div class="col-span-2 text-center text-sm font-semibold">Invoice</div>
   <div class='text-right'>Number</div> 
   <div class="font-medium"><a href="/invoices/{invoice.invoiceNum}" class="anchor">{invoice.invoiceNum}</a></div>
   <HorizontalDivider classes='col-span-2' />
   <div class='text-right'>Amount</div>
   <div class="font-medium ">{currencyFormatter.format(invoice.invoiceAmount)}</div>
   <HorizontalDivider classes='col-span-2' />
   <div class='text-right'>Created</div> 
   <div class="font-medium">{dayjs(invoice.invoiceCreated).format('M/D/YYYY')}</div>
   <HorizontalDivider classes='col-span-2' />
   <div class="text-right">Due</div>
   <div class="font-medium">{dayjs(invoice.invoiceDue).format('M/D/YYYY')}</div>
   <HorizontalDivider classes='col-span-2' />
   <div class='text-right'>Lease ID</div> 
   <div class="truncate font-medium"><a href="/leases/{invoice.leaseId}" class="anchor">{invoice.leaseId}</a></div>
   <HorizontalDivider classes='col-span-2' />
   <div class="text-right">Notes</div> 
   <div class="font-medium">{invoice.invoiceNotes}</div>
   <HorizontalDivider classes='col-span-2' />
   {#if invoice.paymentRecordNum}
      <div class='text-right'>Payment number</div> 
      <div class="font-medium"><a href="/paymentRecords/{invoice.paymentRecordNum}" class="anchor">{invoice.paymentRecordNum}</a></div>
   {:else}
      <div class='col-span-2 m-2'><a href="/paymentRecords/new?defaultCustomer={invoice.customerId}&defaultInvoice={invoice.invoiceNum}" class="btn preset-filled-primary-50-950 rounded-lg h-fit text-wrap text-center">Make a payment record for this invoice</a></div>
   {/if}
   {#if invoice.deposit}
      <HorizontalDivider classes='col-span-2'/>
      <div class="col-span-2 font-medium text-center">Deposit</div>
   {/if}
</div>