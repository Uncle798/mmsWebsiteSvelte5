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
    import utc from 'dayjs/plugin/utc'
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
	import VerticalDivider from '$lib/displayComponents/VerticalDivider.svelte';
	import Address from '$lib/displayComponents/Address.svelte';
    dayjs.extend(utc)
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
        startDate = dayjs.utc(invoices[0].invoiceCreated).startOf('year').toDate();
        minDate = startDate;
        endDate = new Date();
        maxDate = endDate;
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
{#await wrapper}
    <Header title='Loading invoices' />
    Loading {numberFormatter.format(data.invoiceCount)} invoices, 
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
        <Header title='Loading customers' />
        Loading customers...
    {:then customers}
        {#await data.addresses}
            Loading addresses...
        {:then addresses}
            {#if invoices.length >0}
                
            <Header title='All invoices' />
            <div class="flex">
                <Search data={data.searchForm} bind:search={search} searchType='invoice number' classes='h-28'/>
                <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} classes='h-28'/>
            </div>
            <HorizontalDivider />
            <Revenue label="Total invoiced (not including deposits)" amount={totalRevenue(searchedInvoices(dateSearchedInvoices(invoices)))} />
            <HorizontalDivider />
            <div class="grid grid-cols-2 ">
                {#each  slicedInvoices(searchedInvoices(invoices)) as invoice}  
                {@const customer = customers.find((customer) => customer.id === invoice.customerId)}  
                    <InvoiceEmployee {invoice} classes='border-e-2 border-b-2' />
                    {#if customer}
                    {@const address = addresses.find((address) => address.userId === customer.id)}
                    <div class="flex flex-col border-b-2">
                        <User user={customer} classes=''/>
                        {#if address}
                        <Address {address} />
                        {/if}
                    </div>
                    {/if}
                {/each}
            </div>
            <Pagination bind:pageNum={pageNum} bind:size={size} array={searchedInvoices(invoices)} label='invoices' />
            {/if}
        {/await}
    {/await}
{/await}