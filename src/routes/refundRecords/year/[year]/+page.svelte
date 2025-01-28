<script lang="ts">
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Search from '$lib/forms/Search.svelte';
    import dayjs from 'dayjs';
    import type { PageData } from './$types';
    import type { RefundRecord } from '@prisma/client'
	import DateSearch from '$lib/forms/DateSearch.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import Header from '$lib/Header.svelte';
    
    let { data }: { data: PageData } = $props();
    let size = $state(25)
    let pageNum = $state(1)
    let search = $state('');
    let startDate = $state<Date>(new Date());
    let endDate = $state<Date>(new Date());
    let maxDate = $state<Date>();
    let minDate = $state<Date>();
    let wrapper = new Promise<RefundRecord[]>(async res => {
        const refunds = await data.refunds
        res(refunds)
        startDate = dayjs(refunds[0].refundCreated).startOf('year').toDate()
        minDate = dayjs(refunds[0].refundCreated).startOf('year').toDate()
        maxDate = dayjs(refunds[refunds.length-1].refundCreated).endOf('year').toDate()
        endDate = dayjs(refunds[refunds.length-1].refundCreated).endOf('year').toDate()
    })
    const numberFormatter = new Intl.NumberFormat('en-US');
    let slicedRefunds = $derived((refunds:RefundRecord[]) => refunds.slice((pageNum-1)*size, pageNum*size))
    let searchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => refund.refundNumber.toString().includes(search)))
    let dateSearchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => {
        console.log('dateSearchRefunds', startDate)
        if(!startDate || !endDate){
            return
        }
        return refund.refundCreated >= startDate && refund.refundCreated <= endDate
    }))
    let totalRevenue = $derived((refunds:RefundRecord[]) => {
        let totalRevenue:number = 0;
        refunds.forEach((refund) =>{
            totalRevenue += refund.refundAmount
        })
        return totalRevenue
    })
</script>

{#await wrapper}
    <Header title='Refund Records' />
    Loading {numberFormatter.format(data.refundCount)} refund records or select month:
    {#each data.months as month}
        <a href="/refundRecords/year/{dayjs(month).format('YYYY')}/month/{month.getMonth()+1}" class="btn">{dayjs(month).format('MMMM')}</a>
    {/each}
    {:then refunds}
    {#await data.customers}
    Loading customers
    {:then customers} 
        <Header title="{refunds[refunds.length-1].refundCreated.getFullYear().toString()} refund records" />
        <Revenue amount={totalRevenue(searchRefunds(dateSearchRefunds(refunds)))} label='Amount refunded'/>
        <Search data={data.searchForm} bind:search={search} searchType='refund record' />
        <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} minDate={minDate} maxDate={maxDate} />
        {#each slicedRefunds(searchRefunds(dateSearchRefunds(refunds))) as refund}
            {@const customer = customers.find((customer)=> customer.id === refund.customerId)}
            <div class="flex">
                <RefundRecordDisplay refundRecord={refund} />
                {#if customer}
                    <User user={customer} />
                {/if}
            </div>
        {/each}
        <Pagination bind:size={size} bind:pageNum={pageNum} array={searchRefunds(dateSearchRefunds(refunds))} label='refunds' />
    {/await} 
{/await}