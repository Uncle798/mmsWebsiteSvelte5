<script lang="ts">
    import type { PageData } from './$types';
	import type { PaymentRecord } from '@prisma/client';
	import Header from '$lib/Header.svelte';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import { fade } from 'svelte/transition';
	import Search from '$lib/forms/Search.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
    import dayjs from 'dayjs';
    import utc from 'dayjs/plugin/utc'
	import DateSearch from '$lib/forms/DateSearch.svelte';
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
    loading {numberFormatter.format(data.paymentRecordCount)} payment records
    {#if data.months}
        or select month: 
        {#each data.months as month}
            <a href='/paymentRecords/year/{month.getFullYear()}/month/{month.getMonth()}' class="btn">{dayjs(month).format('MMMM')}</a>
        {/each}
    {/if}
    <Placeholder />
{:then paymentRecords} 
    {#await data.customers}
        loading customers
    {:then customers} 
        {#await data.addresses}
            loading contacts
        {:then addresses}         
            {#if paymentRecords.length >0}
                <div transition:fade={{duration:600}}>
                    <div class="flex">
                        <Search bind:search={search} searchType='payment record number' data={data.searchForm}/>      
                        <DateSearch bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} data={data.dateSearchForm}/>
                    </div>
                    <HorizontalDivider />
                    <Revenue label="Total revenue" amount={totalRevenue(searchedPayments(dateSearchPayments(paymentRecords)))} />
                    <HorizontalDivider />
                    <div class="grid grid-cols-2">
                        {#each slicedSource(dateSearchPayments(searchedPayments(paymentRecords))) as paymentRecord}
                        {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId) }
                            <PaymentRecordEmployee paymentRecord={paymentRecord} classes="border-e-2 border-b-2 border-primary-950 p-2 min-w-64" />
                            {#if customer}
                            {@const address = addresses.find((address)=> address.userId === customer.id)}
                            <div class="flex flex-col border-b-2 border-primary-950 min-w-64">
                            <User user={customer} classes='mx-2 mt-2'/>
                                {#if address}
                                    <Address {address} classes='mx-2'/>
                                {/if}
                            </div>
                            {/if}
                        {/each}
                    </div>
                    <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedPayments(paymentRecords)} label='payment records'/>
                </div>
            {:else}
                No payment records from that year
            {/if}
        {/await}
    {/await}
{/await}