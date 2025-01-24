<script lang="ts">
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

{#await data.invoices}
    Loading {data.invoiceCount} invoices or select month:
        {}
{:then invoices}
    {#each invoices as invoice}
        <InvoiceEmployee invoice={invoice} />
    {/each}
    
{/await}