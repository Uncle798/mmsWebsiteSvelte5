<script lang="ts">
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Search from '$lib/forms/Search.svelte';
    import dayjs from 'dayjs';
    import type { PageData } from './$types';
    import type { RefundRecord } from '@prisma/client'
	import DateSearch from '$lib/forms/DateSearch.svelte';
    let { data }: { data: PageData } = $props();
    let size = $state(25)
    let pageNum = $state(1)
    let search = $state('');
    let startDate = $state<Date>(new Date());
    let endDate = $state<Date>(new Date());
    const numberFormatter = new Intl.NumberFormat('en-US');
    let slicedRefunds = $derived((refunds:RefundRecord[]) => refunds.slice((pageNum-1)*size, pageNum*size))
    let searchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => refund.refundNumber.toString().includes(search)))
    let dateSearchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => {
        return refund.refundCreated >= startDate || refund.refundCreated <= endDate
    }))
</script>
{#await data.refunds}
    Loading {numberFormatter.format(data.refundCount)} refund records or select month:
    {#each data.months as month}
        <a href="/refundRecords/year/{dayjs(month).format('YYYY')}/month/{month.getMonth()+1}" class="btn">{dayjs(month).format('MMMM')}</a>
    {/each}
{:then refunds}
    {#await data.customers}
        Loading customers
    {:then customers} 
        <Search data={data.searchForm} bind:search={search} searchType='refund record' />
        <DateSearch data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate}/>
        {#each slicedRefunds(searchRefunds(dateSearchRefunds(refunds))) as refund}
            {@const customer = customers.find((customer)=> customer.id === refund.customerId)}
            <div class="flex">
                <RefundRecordDisplay refundRecord={refund} />
                {#if customer}
                    <User user={customer} />
                {/if}
            </div>
        {/each}
    {/await} 
{/await}