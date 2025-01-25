<script lang="ts">
	import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Search from '$lib/forms/Search.svelte';
    import type { PageData } from './$types';
    import type { RefundRecord } from '@prisma/client'
    let { data }: { data: PageData } = $props();
    let size = $state(25)
    let pageNum = $state(1)
    let search = $state('')
    let slicedRefunds = $derived((refunds:RefundRecord[]) => refunds.slice((pageNum-1)*size, pageNum*size))
   let searchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => refund.refundNumber.toString().includes(search)))
</script>
{#await data.refunds}
    Loading {data.refundCount} refund records
{:then refunds}
    {#await data.customers}
        Loading customers
    {:then customers} 
        <Search data={data.searchForm} bind:search={search} searchType='refund record' />
        {#each slicedRefunds(searchRefunds(refunds)) as refund}
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