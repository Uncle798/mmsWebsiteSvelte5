<script lang="ts">
    import Invoice from '$lib/displayComponents/Invoice.svelte';
    import User from '$lib/displayComponents/User.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.invoice}
{@const {customer} = data.invoice}
    <Invoice invoice={data.invoice} />
    {#if customer}
        <User user={customer} />
    {/if}
{/if}