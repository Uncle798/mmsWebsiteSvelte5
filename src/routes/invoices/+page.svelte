<script lang="ts">
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import User from '$lib/displayComponents/User.svelte';
	import type { Invoice } from '@prisma/client';
	import { superForm } from 'sveltekit-superforms';
    import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import { Heart } from 'lucide-svelte';
	import Header from '$lib/Header.svelte';
    import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
	import Search from '$lib/forms/Search.svelte';

    let { data }: { data: PageData } = $props();
    let pageNum = $state(1);
    let size = $state(25);
    let search = $state('');
    let slicedInvoices = $derived((invoices:Invoice[]) => invoices.slice((pageNum-1)*size, pageNum*size));
    let searchedInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => invoice.invoiceNum.toString().includes(search)))
</script>
<Header title='All invoices' />
{#await data.invoices}
    Loading {data.invoiceCount} invoices, 
    {#if data.years}
        or select year: 
        {#each data.years as year}
            <a href="/invoices/year/{year}" class="btn">{year.toString()},</a>
        {/each}
    {/if}
    or:
        <a href="/invoices/unpaid" class="btn">Unpaid invoices</a>

    <Placeholder />
{:then invoices}
    {#await data.customers}
        <Search data={data.searchForm} bind:search={search} searchType='invoice number' />
        {#each  slicedInvoices(searchedInvoices(invoices)) as invoice}    
            <div class="flex" transition:fade={{duration:600}}>
                <InvoiceEmployee invoice={invoice} />
            </div>
        {/each}
        <Pagination bind:pageNum={pageNum} bind:size={size} array={searchedInvoices(invoices)} label='invoices'/>
    {:then customers} 
        <Search data={data.searchForm} bind:search={search} searchType='invoice number'/>
        {#each  slicedInvoices(searchedInvoices(invoices)) as invoice}  
            {@const customer = customers.find((customer) => customer.id === invoice.customerId)}  
            <div class="flex" transition:fade={{duration:600}}>
                <InvoiceEmployee invoice={invoice} />
                {#if customer}
                    <User user={customer} />
                {/if}
            </div>
        {/each}
        <Pagination bind:pageNum={pageNum} bind:size={size} array={searchedInvoices(invoices)} label='invoices' />
    {/await}
{/await}