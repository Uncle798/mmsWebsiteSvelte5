<script lang="ts">
	import RefundRecordEmployee from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Search from '$lib/forms/Search.svelte';
    import dayjs from 'dayjs';
    import type { PageData } from './$types';
    import type { RefundRecord } from '@prisma/client'
	import DateSearch from '$lib/forms/DateSearch.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import Header from '$lib/Header.svelte';
    import Address from '$lib/displayComponents/AddressEmployee.svelte';
    
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
            {#await data.addresses}
                Loading addresses
            {:then addresses} 
                {#if refunds.length > 0}
                <div class="flex mx-2 border-b-2 border-primary-50-950 ">
                    <Search
                        bind:search 
                        searchType="Refund records" 
                        data={data.searchForm} 
                        classes='p-2 '	
                    />
                    <DateSearch 
                        bind:endDate 
                        bind:startDate 
                        data={data.dateSearchForm} 
                        {minDate} 
                        {maxDate} 
                        classes='p-2'	
                    />
                </div>
                <Revenue 
                    label="Total refunds" 
                    amount={totalRevenue(searchRefunds(dateSearchRefunds(refunds)))}
                    classes='border-b-2 border-primary-50-950 m-2'	
                />
                <div class="grid grid-cols-2 mx-2 gap-y-3 gap-x-1 ">
                    {#each slicedRefunds(searchRefunds(dateSearchRefunds(refunds))) as refund (refund.refundNumber)}
                        {@const customer = customers.find((customer) => customer.id === refund.customerId)}
                            <RefundRecordEmployee refundRecord={refund} classes='px-2 pt-2 border-2 rounded-lg border-primary-50-950'/>
                            {#if customer}
                            {@const address = addresses.find((address) => address.userId === customer.id)}
                                <div class="flex flex-col rounded-lg border-2 border-primary-50-950">
                                    <UserEmployee user={customer} classes='pt-2 pl-2 ' />
                                    {#if address}
                                        <Address {address} classes='pl-2'/>
                                    {/if}
                                </div>
                            {/if}
                    {/each}
                </div>
                <Pagination bind:size bind:pageNum label="refund records" array={searchRefunds(dateSearchRefunds(refunds))} />
            {/if}
        {/await}
    {/await} 
{/await}