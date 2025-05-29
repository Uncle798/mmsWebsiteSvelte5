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
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import { goto } from '$app/navigation';
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
    let yearSelect = $state(['']);
    interface ComboboxData {
        label: string;
        value: string;
    }
    let yearComboboxData:ComboboxData[] = [
        {label:'Unpaid Invoices', value: 'unpaid'},
    ]
    data.years.forEach((year) => {
        yearComboboxData.push({label:year.toString(), value: year.toString()})
    })

</script>
{#await wrapper}
    <Header title='Loading invoices' />
    <div class="bg-tertiary-50 dark:bg-tertiary-950 w-full rounded-b-lg fixed top-8 p-2 z-40">Total invoiced (not including deposits):</div>
    <div class="mx-1 sm:mx-2 mt-10 sm:mt-10" in:fade={{duration:600}}>
        Loading {numberFormatter.format(data.invoiceCount)} invoices, 
        <Combobox
            data={yearComboboxData}
            bind:value={yearSelect}
            label='or select year'
            placeholder='Select year...'
            openOnClick={true}
            onValueChange={(details) => {
                goto(`/invoices/year/${details.value[0]}`)
            }}
            classes='mx-1 sm:mx-2 z-40'
        />
        <Placeholder numCols={4} numRows={1} heightClass='h-10' classes='z-0'/>
        <Placeholder numCols={2} numRows={size} heightClass='h-40' classes='z-0'/>
    </div>
    
    {:then invoices}
    {#await data.customers}
        <Header title='Loading customers' />
        <Placeholder numCols={4} numRows={1} heightClass='h-10'/>
        <Placeholder numCols={2} numRows={size} heightClass='h-40'/>
    {:then customers}
        {#await data.addresses}
            <Placeholder numCols={4} numRows={1} heightClass='h-10'/>
            <Placeholder numCols={2} numRows={size} heightClass='h-40'/>
        {:then addresses}
            {#if invoices.length >0}
                <Header title='All invoices' />
                <Revenue 
                    label="Total invoiced (not including deposits)" 
                    amount={totalRevenue(searchedInvoices(dateSearchedInvoices(invoices)))} 
                    classes='bg-tertiary-50 dark:bg-tertiary-950 w-full rounded-b-lg sticky top-8 p-2 z-50'
                />

                <div class="flex mx-1 sm:mx-2 border-b-2 dark:border-primary-950 border-primary-50 sticky top-16 bg-surface-50-950 z-40" transition:fade={{duration:600}}>
                    <Search data={data.searchForm} bind:search={search} searchType='invoice number' classes='w-1/2 p-2'/>
                    <Search data={data.searchForm} bind:search={nameSearch} searchType='Customer' classes='w-1/2 p-2'/>
                    <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} classes='w-1/2 p-2'/>
                </div>

                <div class="grid grid-cols-1 sm:m-2 m-1 gap-3" transition:fade={{duration:600}}>
                    {#each  slicedInvoices(searchedInvoices(searchByUser(invoices))) as invoice}  
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
                <Pagination bind:pageNum={pageNum} bind:size={size} array={searchedInvoices(searchByUser(invoices))} label='invoices' />
            {/if}
        {/await}
    {/await}
{/await}