<script lang="ts">
   import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import User from '$lib/displayComponents/User.svelte';
   import type { PageData } from './$types';
   import type { RefundRecord } from '@prisma/client';
   import { Pagination } from '@skeletonlabs/skeleton-svelte';

   let { data }: { data: PageData } = $props();
   let { refunds } = data;
   let pageNum = $state(1);
   let size = $state(25);
   let slicedRefunds = $derived((refunds:RefundRecord[]) => refunds.slice((pageNum-1)*size, pageNum*size) )
</script>

{#each slicedRefunds(refunds) as refund}
   {@const {customer} = refund }
   <div class="flex">
      <RefundRecordDisplay refundRecord={refund} />
      {#if customer}
         <User user={customer} />
      {/if}
   </div>

{/each}
<footer class="flex justify-between">
   <select name="size" id="size" class="select" bind:value={size}>
      {#each [5,10,25,50] as v}
         <option value={v}>Show {v} refund records per page</option>
      {/each}
      <option value={refunds.length}>Show all {refunds.length} Refund records</option>
   </select>
   <Pagination data={refunds} bind:page={pageNum} bind:pageSize={size} alternative/>
</footer>