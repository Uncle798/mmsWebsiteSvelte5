<script lang="ts">
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
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
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
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
    <div class="mt-10">

        Loading {numberFormatter.format(data.invoiceCount)} invoices, 
        {#if data.years}
            or select year: 
            {#each data.years as year}
                <a href="/invoices/year/{year}" class="anchor">{year.toString()},</a>
            {/each}
        {/if}
        or:
        <a href="/invoices/unpaid" class="anchor">Unpaid invoices</a>
    </div>
    
    <Placeholder numCols={1} numRows={2} heightClass='h-10'/>
    <Placeholder numCols={2} numRows={size} heightClass='h-40'/>
    {:then invoices}
    {#await data.customers}
        <Header title='Loading customers' />
        <Placeholder numCols={1} numRows={2} heightClass='h-10'/>
        <Placeholder numCols={2} numRows={size} heightClass='h-40'/>
    {:then customers}
        {#await data.addresses}
            <Placeholder numCols={1} numRows={2} heightClass='h-10'/>
            <Placeholder numCols={2} numRows={size} heightClass='h-40'/>
        {:then addresses}
            {#if invoices.length >0}
                <Header title='All invoices' />
                <div class="flex m-1 sm:m-2 border-b-2 dark:border-primary-950 border-primary-50 mt-8" transition:fade={{duration:600}}>
                    <Search data={data.searchForm} bind:search={search} searchType='invoice number' classes='w-1/2 p-2'/>
                    <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} classes='w-1/2 p-2'/>
                </div>
                <Revenue 
                    label="Total invoiced (not including deposits)" 
                    amount={totalRevenue(searchedInvoices(dateSearchedInvoices(invoices)))} 
                    classes='border-b-2 dark:border-primary-950 border-primary-50 m-2 drop-shadow-2xl'
                />
                <div class="grid grid-cols-1 sm:mx-2 mx-1 gap-3" transition:fade={{duration:600}}>
                    {#each  slicedInvoices(searchedInvoices(invoices)) as invoice}  
                    {@const customer = customers.find((customer) => customer.id === invoice.customerId)}
                        <div class="sm:grid sm:grid-cols-2 border-2 border-primary-50 dark:border-primary-950 rounded-lg">
                            <InvoiceEmployee {invoice} classes=' px-2' />
                            {#if customer}
                            {@const address = addresses.find((address) => address.userId === customer.id)}
                                <div class="flex flex-col px-2 pt-2">
                                    <UserEmployee user={customer} classes=''/>
                                    {#if address}
                                        <Address {address} />
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
                <Pagination bind:pageNum={pageNum} bind:size={size} array={searchedInvoices(invoices)} label='invoices' />
            {/if}
        {/await}
    {/await}
{/await}