<script lang="ts">
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Search from '$lib/forms/Search.svelte';
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
    loading {data.invoiceCount} invoices
{:then invoices}
    {#await data.customers}
        loading customers
    {:then customers} 
        <Search search={search} searchType='invoice number' data={data.searchForm}/>
        {#each slicedInvoices(searchedInvoices(invoices)) as invoice}
        {@const customer = customers.find((customer) => customer.id === invoice.customerId)}
            <div class="flex">
                <InvoiceEmployee invoice={invoice} />
                {#if customer}
                    <User user={customer} />
                {/if}
            </div>
            {/each}
            <Pagination pageNum={pageNum} size={size} array={searchedInvoices(invoices)} label='invoices'/>
    {/await}
{/await}