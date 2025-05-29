<script lang="ts">
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import type { Invoice, User } from '@prisma/client';
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
    let customers:User[] = [];
    const userWrapper = new Promise<User[]>(async res => {
        customers = await data.customers
        res(customers)
    })
    let nameSearch = $state('');
    let currentUsers = $derived((users:User[]) => users.filter((user) => {
        return user.givenName?.toLowerCase().includes(nameSearch.toLowerCase()) || user.familyName?.toLowerCase().includes(nameSearch.toLowerCase())
    }))
    const searchByUser = $derived((invoices:Invoice[]) => {
        const users = currentUsers(customers);
        const customerInvoices:Invoice[] = [];
        users.forEach((user)=>{
            const userInvoices = invoices.filter((invoice) => {
                return invoice.customerId === user.id
            })
            userInvoices.forEach((invoice) => {
                customerInvoices.push(invoice)
            })
        })
        return customerInvoices
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
    <Placeholder numCols={2} numRows={3} heightClass='h-32'/>
{:then invoices}
    {#await data.customers}
        <Header title='Loading customers' />
        Loading customers...
    {:then customers}
        {#await data.addresses}
            Loading addresses...
        {:then addresses}
            {#if invoices.length >0}       
                <Header title='Unpaid invoices' />
                <Revenue label="Current Unpaid Invoice total" amount={totalRevenue(searchedInvoices(dateSearchedInvoices(invoices)))} classes="bg-tertiary-50 dark:bg-tertiary-950 w-full rounded-b-lg sticky top-8 p-2 z-40"/>
                <div class="flex gap-1 mx-1 sm:mx-2 sticky top-18 left-0 bg-surface-50-950 border-b-2 border-primary-50-950 z-30">
                    <div class="flex flex-col sm:flex-row">
                        <Search data={data.searchForm} bind:search={search} searchType='invoice number' classes='w-1/2'/>
                        <Search data={data.searchForm} bind:search={nameSearch} searchType='customer' classes='w-1/2'/>
                    </div>
                    <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} classes=""/>
                </div>
                <div class="grid grid-cols-1 gap-y-3 gap-x-1 m-2 z-30">
                    {#each  slicedInvoices(searchedInvoices(searchByUser(invoices))) as invoice}  
                    {@const customer = customers.find((customer) => customer.id === invoice.customerId)}  
                        <div class="rounded-lg border dark:border-primary-950 border-primary-50 flex flex-col sm:flex-row">                            
                            <InvoiceEmployee {invoice} classes='px-2' />
                            {#if customer}
                            {@const address = addresses.find((address) => address.userId === customer.id)}
                                <div class="flex flex-col  px-2 pt-2">
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