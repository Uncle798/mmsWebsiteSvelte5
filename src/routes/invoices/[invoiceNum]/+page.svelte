<script lang="ts">
    import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
    import User from '$lib/displayComponents/User.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.invoice}
{@const {customer} = data.invoice}
    <InvoiceEmployee invoice={data.invoice} />
    {#if customer}
        <User user={customer} />
    {/if}
{/if}