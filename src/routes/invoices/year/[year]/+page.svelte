<script lang="ts">
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Search from '$lib/forms/Search.svelte';
	import dayjs from 'dayjs';
    import type { PageData } from './$types';
    import type { Invoice } from '@prisma/client';

    let { data }: { data: PageData } = $props();
    let pageNum = $state(1);
    let size = $state(25);
    let search = $state('');
    let slicedInvoices = $derived((invoices:Invoice[]) => invoices.slice((pageNum-1)*size, pageNum*size));
    let searchedInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => invoice.invoiceNum.toString().includes(search)))
</script>

{#await data.invoices}
    Loading {data.invoiceCount} invoices or select month:
        {#each data.months as month}
            <a href="/invoices/year/{dayjs(month).format('YYYY')}/month/{month.getMonth()+1}" class="btn">{dayjs(month).format('MMMM')}</a>
        {/each}
    <Placeholder />
{:then invoices}
    {#await data.customers}
        <Search data={data.searchForm} searchType='invoice number' bind:search={search}/>
        {#each slicedInvoices(searchedInvoices(invoices)) as invoice}
            <InvoiceEmployee invoice={invoice} />
        {/each}
        <Pagination array={searchedInvoices(invoices)} bind:pageNum={pageNum} bind:size={size} label='invoices'/>
        {:then customers} 
            <Search data={data.searchForm} searchType='invoice number' bind:search={search}/>
            {#each invoices as invoice}
                {@const customer = customers.find((customer) => customer.id === invoice.customerId)}
                <div class="flex">
                        <InvoiceEmployee invoice={invoice}/>
                        {#if customer}
                            <User user={customer} />
                        {/if}
                    </div>
            {/each}
            <Pagination array={searchedInvoices(invoices)} bind:pageNum={pageNum} bind:size={size} label='invoices'/>
    {/await}
{/await}