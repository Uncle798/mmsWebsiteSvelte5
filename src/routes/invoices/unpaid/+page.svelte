<script lang="ts">
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import Header from '$lib/Header.svelte';
	import { superForm } from 'sveltekit-superforms';
   import type { PageData } from './$types';
	import type { Invoice } from '@prisma/client';
   import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
   let { data }: { data: PageData } = $props();
   let { form, enhance } = superForm(data.searchForm, {
      onChange(event) {
         search = event.get('search')
      },
   })
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   const numberFormatter = new Intl.NumberFormat('en-US')
   let slicedSource = $derived((invoices:Invoice[]) => invoices.slice((pageNum-1)*size, pageNum*size));
   let searchedInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => invoice.invoiceNum.toString().includes(search)))
   const totalInvoiced = $derived((invoices:Invoice[]) => {
      let totalInvoiced = 0;
      invoices.forEach((invoice) => {
         totalInvoiced += invoice.invoiceAmount
      });
      return totalInvoiced;
   })
</script>

<Header title='Unpaid invoices' />
{#await data.invoices}
   Loading {numberFormatter.format(data.invoiceCount)} invoices 
{:then invoices} 
   <Revenue label='Total invoiced without payment record' amount={totalInvoiced(searchedInvoices(invoices))} />
   <Search data={data.searchForm} bind:search={search} searchType='invoice number' />
   {#each slicedSource(searchedInvoices(invoices)) as invoice }
      <InvoiceEmployee invoice={invoice} />
   {/each}
   <Pagination bind:pageNum={pageNum} bind:size={size} label='invoices' array={searchedInvoices(invoices)}/>
{/await}