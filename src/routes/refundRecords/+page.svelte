<script lang="ts">
   import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
   import type { RefundRecord } from '@prisma/client';
   import { superForm } from 'sveltekit-superforms';
   import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
	import Search from '$lib/forms/Search.svelte';

   let { data }: { data: PageData } = $props();
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   const numberFormatter = new Intl.NumberFormat('en-US');
   let slicedRefunds = $derived((refunds:RefundRecord[]) => refunds.slice((pageNum-1)*size, pageNum*size))
   let searchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => refund.refundNumber.toString().includes(search)))
</script>
<Header title='Refunds' />
{#await data.refunds}
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
      <Search bind:search={search} searchType='Refund records' data={data.searchForm}/>
      {#each slicedRefunds(searchRefunds(refunds)) as refund (refund.refundNumber)}
      {@const customer = customers.find((customer) => customer.id === refund.customerId)}
         <div class="flex">
            <RefundRecordDisplay refundRecord={refund} />
            {#if customer}
               <User user={customer} />
            {/if}
         </div>
      {/each}
      <Pagination bind:size={size} bind:pageNum={pageNum} label='refund records' array={searchRefunds(refunds)}/> 
   {/await}
{/await}