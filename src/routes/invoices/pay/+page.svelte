<script lang="ts">
    import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

{#if data.invoice}
    <InvoiceCustomer invoice={data.invoice} />
{/if}
