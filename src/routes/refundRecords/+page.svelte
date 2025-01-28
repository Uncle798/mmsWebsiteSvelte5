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
   import Placeholder from '$lib/displayComponents/Placeholder.svelte';
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
        startDate = dayjs(refunds[0].refundCreated).startOf('year').toDate()
        minDate = startDate;
        maxDate = new Date();
        endDate = maxDate;
        res(refunds)
    })
    const numberFormatter = new Intl.NumberFormat('en-US');
    let slicedRefunds = $derived((refunds:RefundRecord[]) => refunds.slice((pageNum-1)*size, pageNum*size))
    let searchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => refund.refundNumber.toString().includes(search)))
    let dateSearchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => {
        if(!startDate || !endDate){
            return refund
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
<Header title='All Refunds' />
{#await wrapper}
   loading {numberFormatter.format(data.refundCount)} refunds 
   {#if data.years}
      or select year: 
      {#each data.years as year}
         <a href="/refundRecords/year/{year}" class="btn">{year.toString()},</a>
      {/each}
   {/if}
   <Placeholder />
{:then refunds}
   {#await data.customers}
      loading customers
   {:then customers} 
      <Revenue label='Total refunds' amount={totalRevenue(searchRefunds(dateSearchRefunds(refunds)))}/>
      <div class="flex">
         <Search bind:search={search} searchType='Refund records' data={data.searchForm}/>
         <DateSearch bind:endDate={endDate} bind:startDate={startDate} data={data.dateSearchForm} {minDate} {maxDate}/>
      </div>
      {#each slicedRefunds(searchRefunds(dateSearchRefunds(refunds))) as refund (refund.refundNumber)}
      {@const customer = customers.find((customer) => customer.id === refund.customerId)}
         <div class="flex">
            <RefundRecordDisplay refundRecord={refund} />
            {#if customer}
               <User user={customer} />
            {/if}
         </div>
      {/each}
      <Pagination bind:size={size} bind:pageNum={pageNum} label='refund records' array={searchRefunds(dateSearchRefunds(refunds))}/> 
   {/await}
{/await}