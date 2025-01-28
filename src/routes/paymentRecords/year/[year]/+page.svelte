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
	import DateSearch from '$lib/forms/DateSearch.svelte';
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
        startDate = dayjs(paymentRecords[0].paymentCreated).startOf('year').toDate();
        minDate = startDate;
        endDate = dayjs(paymentRecords[paymentRecords.length-1].paymentCreated).endOf('year').toDate();
        maxDate = endDate;
    })
    const numberFormatter = new Intl.NumberFormat('en-US');
    const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
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
        paymentRecords.forEach((paymentRecord) => {
            if(paymentRecord.paymentCompleted){
                totalRevenue += paymentRecord.paymentAmount
            }
        })
        return totalRevenue;
    })
</script>

<Header title='Payment Records' />
{#await wrapper}
    loading {numberFormatter.format(data.paymentRecordCount)} payment records or select month: 
    {#each data.months as month}
        <a href="/paymentRecords/year/{dayjs(month).format('YYYY')}/month/{month.getMonth()+1}" class="btn">{dayjs(month).format('MMMM')}</a>
    {/each}
    <Placeholder />
{:then paymentRecords} 
    {#await data.customers}
        loading customers
    {:then customers} 
          <div transition:fade={{duration:600}}>
            <div>
                Total revenue: {currencyFormatter.format(totalRevenue(searchedPayments(dateSearchPayments(paymentRecords))))}
            </div>
            <div class="flex">
                <Search bind:search={search} searchType='payment record number' data={data.searchForm}/>      
                <DateSearch bind:startDate={startDate} bind:endDate={endDate} {minDate} {maxDate} data={data.dateSearchForm}/>
            </div>
            {#each slicedSource(searchedPayments(paymentRecords)) as paymentRecord}
            {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId) }
            <div class="flex">
                <PaymentRecordEmployee paymentRecord={paymentRecord} />
                {#if customer}
                    <User user={customer} />
                {/if}
            </div>
            {/each}
            <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedPayments(paymentRecords)} label='payment records'/>
        </div>
    {/await}
{/await}