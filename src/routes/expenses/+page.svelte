<script lang="ts">
   import type { PageProps } from './$types';
   import Expense from '$lib/displayComponents/Expense.svelte';
   import type { Expense as ExpenseType } from '../../generated/prisma/browser';
	import RevenueBar from '$lib/displayComponents/RevenueBar.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
   let { data }: PageProps = $props();
   const totalExpenses = $derived((expenses:ExpenseType[]) => {
      let total = 0;
      for(const expense of expenses){
         total += expense.amount;
      }
      return total;
   })
</script>

<div class="mt-14 sm:mt-12 mb-8">
   <RevenueBar>
      {#snippet content()}
         <Revenue amount={totalExpenses(data.expenses)} label='Total expenses'/>
      {/snippet}
   </RevenueBar>
   {#each data.expenses as expense}
   {@const employee = data.employees.find((emp) => emp.id === expense.employeeId)}
   {@const vendor = data.vendors.find((ven) => ven.id === expense.vendorId)}
      {#if employee && vendor}
         <Expense {expense} {employee} {vendor} />
      {/if}
   {/each}
</div>