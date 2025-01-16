<script lang="ts">
   import RefundRecord from '$lib/displayComponents/RefundRecord.svelte';
import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

{#each data.refunds as refund}
   <RefundRecord refundRecord={refund} />
{/each}