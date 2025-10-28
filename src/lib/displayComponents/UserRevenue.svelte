<script lang='ts'>
	import type { User } from "@prisma/client";

   interface Props {
      totalInvoiced: number;
      totalPaid: number;
      overdueAmount: number;
      customer: User;
      classes?: string; 
   }
   let { totalInvoiced, totalPaid, overdueAmount, customer, classes }:Props = $props();

   let currencyFormatter = Intl.NumberFormat('EN-US', {style: 'currency', currency: 'USD'});
</script>
<div class="flex flex-col sm:flex-row gap-2 bg-primary-contrast-100-900 p-2 rounded-lg {classes}">
   <p class="text-error-400-600">Total invoiced: {currencyFormatter.format(totalInvoiced)}</p>
   <p class="text-success-300-700">Total paid: {currencyFormatter.format(totalPaid)}</p>
   {#if overdueAmount > 1}
      <p class="text-error-100-900">Overdue amount: <a href="/paymentRecords/new?userId={customer.id}">{currencyFormatter.format(overdueAmount)}</a></p>
   {:else}
      <p class="text-success-300-700">Overdue amount: {currencyFormatter.format(0.0)}</p>
   {/if}
</div>