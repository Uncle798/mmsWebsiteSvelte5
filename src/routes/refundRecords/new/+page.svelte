<script lang="ts">
    import PaymentRecord from '$lib/displayComponents/PaymentRecord.svelte';
import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

{#each data.paymentRecords as paymentRecord}
    <PaymentRecord paymentRecord={paymentRecord}/>
{/each}