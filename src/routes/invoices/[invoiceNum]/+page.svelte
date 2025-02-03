<script lang="ts">
    import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
    import User from '$lib/displayComponents/User.svelte';
	import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.invoice}
{@const {customer} = data.invoice}
    <Header title="Invoice number {data.invoice.invoiceNum}" />
    <InvoiceEmployee invoice={data.invoice} />
    {#if customer}
        <User user={customer} />
    {/if}
{/if}