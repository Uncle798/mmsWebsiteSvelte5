<script lang='ts'>
	import type { User, Invoice } from "../../generated/prisma/browser";
   import { currencyFormatter } from "$lib/utils/currencyFormatter";

   interface Props {
      totalInvoiced: number;
      totalPaid: number;
      overdueAmount: number;
      customer: User;
      invoices?: Invoice[];
      classes?: string; 
   }
   let { totalInvoiced, totalPaid, overdueAmount, customer, classes, invoices }:Props = $props();
</script>
<div class="flex flex-col sm:flex-row sm:gap-2 bg-primary-contrast-100-900 p-2 rounded-lg {classes}">
   <p class="text-error-400-600">Total invoiced: {currencyFormatter(totalInvoiced)}</p>
   <p class="text-success-300-700">Total paid: {currencyFormatter(totalPaid)}</p>
   {#if overdueAmount > 0 && invoices?.length === 1}
      <p class="text-error-100-900">Overdue amount: <a href="/paymentRecords/new?userId={customer.id}&invoiceNum={invoices[0].invoiceNum}">{currencyFormatter(overdueAmount)}</a></p>
   {:else if overdueAmount > 0}
      <p class="text-error-100-900">Overdue amount: <a href="/paymentRecords/new?userId={customer.id}">{currencyFormatter(overdueAmount)}</a></p>

   {:else}
      <p class="text-success-300-700">Overdue amount: {currencyFormatter(0.0)}</p>
   {/if}
</div>