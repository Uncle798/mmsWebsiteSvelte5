<script lang="ts">
    import type { PageData } from './$types';
	import type { PaymentRecord } from '@prisma/client';
	import Header from '$lib/Header.svelte';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import { fade } from 'svelte/transition';
	import Search from '$lib/forms/Search.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
    import dayjs from 'dayjs';
    import utc from 'dayjs/plugin/utc'
	import DateSearch from '$lib/forms/DateSearch.svelte';
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
    let wrapper = new Promise<PaymentRecord[]>(async res => {
        const paymentRecords = await data.paymentRecords
        res(paymentRecords)
        if(paymentRecords.length > 0){
            startDate = dayjs.utc(paymentRecords[0].paymentCreated).startOf('year').toDate();
            minDate = startDate;
            endDate = dayjs.utc(paymentRecords[paymentRecords.length-1].paymentCreated).endOf('year').toDate();
            maxDate = endDate;
        }
    })
    const numberFormatter = new Intl.NumberFormat('en-US');
    let slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
    let searchedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search) ))
    let dateSearchPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => {
        if(!startDate || !endDate){
            return
        }
        return paymentRecord.paymentCreated >= startDate && paymentRecord.paymentCreated <= endDate;
    }))
    let totalRevenue = $derived((paymentRecords:PaymentRecord[]) => {
        let totalRevenue = 0;
        if(paymentRecords[0]){
            paymentRecords.forEach((paymentRecord) => {
                if(paymentRecord.paymentCompleted && !paymentRecord.refunded){
                    totalRevenue += paymentRecord.paymentAmount
                }
            })
        }
        return totalRevenue;
    })
</script>

<Header title='Payment Records' />
{#await wrapper}
    <div class="mt-10ss">
        Loading {numberFormatter.format(data.paymentRecordCount)} payment records...
    </div>
    <Placeholder numCols={2} numRows={3} heightClass='h-32'/>
    {:then paymentRecords} 
    {#await data.customers}
        Loading customers
        <Placeholder numCols={2} numRows={3} heightClass='h-32'/>
    {:then customers} 
    {#await data.addresses}
            Loading contacts
            <Placeholder numCols={2} numRows={3} heightClass='h-32'/>
        {:then addresses}         
            {#if paymentRecords.length >0}
                <div transition:fade={{duration:600}}>
                    <div class=" bg-tertiary-50 dark:bg-tertiary-950 w-full rounded-b-lg p-2 fixed">
                        <Revenue 
                           label="Total revenue" 
                           amount={totalRevenue(searchedPayments(dateSearchPayments(paymentRecords)))} 
                           classes='mt-2'    
                        />
                        </div>
                        <div transition:fade={{duration:600}} class=''>
                           <div class="flex border-b-2 border-primary-50 dark:border-primary-950  mx-1 sm:mx-2 mt-10">
                              <Search 
                                 bind:search={search} 
                                 searchType='payment record number' 
                                 data={data.searchForm}
                                 classes='p-2 w-1/2'
                              />      
                              <DateSearch 
                                 bind:startDate={startDate} 
                                 bind:endDate={endDate} 
                                 {minDate} 
                                 {maxDate} 
                                 data={data.dateSearchForm}
                                 classes='p-2 flex flex-col md:grid md:grid-cols-2'    
                              />
                           </div>
            
                    <div class="grid grid-cols-1 gap-y-3 gap-x-1 m-2">
                        {#each slicedSource(dateSearchPayments(searchedPayments(paymentRecords))) as paymentRecord}
                        {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId) }
                            <div class=" rounded-lg border border-primary-50 dark:border-primary-950  md:flex md:w-full">
                                <PaymentRecordEmployee paymentRecord={paymentRecord} classes="p-2 md:w-1/2" />
                                {#if customer}
                                {@const address = addresses.find((address)=> address.userId === customer.id)}
                                <div class="flex flex-col md:w-1/2">
                                    <UserEmployee user={customer} classes='mx-2 mt-2'/>
                                    {#if address}
                                    <Address {address} classes='mx-2'/>
                                    {/if}
                                </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                    <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedPayments(paymentRecords)} label='payment records'/>
                </div>
            </div>
            {:else}
                No payment records from that month
            {/if}
        {/await}
    {/await}
{/await}