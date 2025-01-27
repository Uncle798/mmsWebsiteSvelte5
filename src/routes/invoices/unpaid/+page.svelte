<script lang="ts">
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import Header from '$lib/Header.svelte';
	import { superForm } from 'sveltekit-superforms';
   import type { PageData } from './$types';
	import type { Invoice } from '@prisma/client';
   import { Pagination } from '@skeletonlabs/skeleton-svelte';
   let { data }: { data: PageData } = $props();
   let { form, enhance } = superForm(data.searchForm, {
      onChange(event) {
         search = event.get('search')
      },
   })
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   const numberFormatter = new Intl.NumberFormat('en-US')
   let slicedSource = $derived((invoices:Invoice[]) => invoices.slice((pageNum-1)*size, pageNum*size));
   let searchedInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => invoice.invoiceNum.toString().includes(search)))
</script>
<Header title='Unpaid invoices' />

{#await data.invoices}
   Loading {numberFormatter.format(data.invoiceCount)} invoices 
{:then invoices} 
<form method="POST" use:enhance>
   <div>
       <label class="label-text">Search by invoice number
           <input type="search" name="search" id="search" class="input" placeholder="Search by invoice number...">
           <button class="btn" type="button" onclick={()=> {$form.search = ''; search='' }}>Clear</button>
       </label>
   </div>
</form>
   {#each slicedSource(searchedInvoices(invoices)) as invoice }
      <InvoiceEmployee invoice={invoice} />
   {/each}
   <footer class="flex justify-between">
      <select name="size" id="size" class="select" bind:value={size}>
          {#each [5,10,25,50] as v}
          <option value={v}>Show {v} units per page</option>
          {/each}
          <option value={searchedInvoices(invoices).length}>Show all {searchedInvoices(invoices).length} units</option>
      </select>
      <Pagination data={searchedInvoices(invoices)} bind:page={pageNum} bind:pageSize={size} alternative/>
  </footer>
{/await}