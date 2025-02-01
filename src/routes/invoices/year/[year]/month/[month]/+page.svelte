<script lang="ts">
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import User from '$lib/displayComponents/User.svelte';
	import type { Invoice } from '@prisma/client';
    import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import Header from '$lib/Header.svelte';
    import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
	import Search from '$lib/forms/Search.svelte';
	import DateSearch from '$lib/forms/DateSearch.svelte';
	import dayjs from 'dayjs';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
	import VerticalDivider from '$lib/displayComponents/VerticalDivider.svelte';

    let { data }: { data: PageData } = $props();
    let pageNum = $state(1);
    let size = $state(25);
    let search = $state('');
    let startDate = $state<Date>(new Date());
    let endDate = $state<Date>(new Date());
    let maxDate = $state<Date>();
    let minDate = $state<Date>();
    const numberFormatter = new Intl.NumberFormat('en-US');
    const wrapper = new Promise<Invoice[]>(async res => {
        const invoices = await data.invoices
        startDate = dayjs(invoices[0].invoiceCreated).startOf('year').toDate();
        minDate = startDate;
        endDate = new Date();
        maxDate = minDate;
        res(invoices)
    })
    let slicedInvoices = $derived((invoices:Invoice[]) => invoices.slice((pageNum-1)*size, pageNum*size));
    let searchedInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => invoice.invoiceNum.toString().includes(search)));
    let dateSearchedInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => {
        if(!startDate || !endDate){
            return
        }
        return invoice.invoiceCreated >= startDate && invoice.invoiceCreated <= endDate
    }))
    let totalRevenue = $derived((invoices:Invoice[]) => {
        let totalRevenue = 0;
        invoices.forEach((invoice) => {
            if(!invoice.deposit){
                totalRevenue += invoice.invoiceAmount
            }
        })
        return totalRevenue
    })
</script>
<Header title='All invoices' />
{#await wrapper}
    Loading {numberFormatter.format(data.invoiceCount)} invoices
    or:
        <a href="/invoices/unpaid" class="btn">Unpaid invoices</a>

    <Placeholder />
{:then invoices}
    {#await data.customers}
        loading customers
        <Placeholder />
    {:then customers}
        <Revenue label="Total invoiced (not including deposits)" amount={totalRevenue(searchedInvoices(dateSearchedInvoices(invoices)))} />
        <HorizontalDivider />
        <div class="flex">
            <Search data={data.searchForm} bind:search={search} searchType='invoice number'/>
            <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} />
        </div>
        <HorizontalDivider />
        {#each  slicedInvoices(searchedInvoices(invoices)) as invoice}  
            {@const customer = customers.find((customer) => customer.id === invoice.customerId)}  
            <div class="flex" transition:fade={{duration:600}}>
                <InvoiceEmployee invoice={invoice} />
                <VerticalDivider heightClass='h-30' />
                {#if customer}
                    <User user={customer} widthClass='w-1/3'/>
                {/if}
            </div>
            <HorizontalDivider />
        {/each}
        <Pagination bind:pageNum={pageNum} bind:size={size} array={searchedInvoices(invoices)} label='invoices' />
    {/await}
{/await}