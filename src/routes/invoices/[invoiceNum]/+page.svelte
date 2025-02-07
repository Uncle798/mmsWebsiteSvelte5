<script lang="ts">
	import Address from '$lib/displayComponents/Address.svelte';
    import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
    import User from '$lib/displayComponents/User.svelte';
	import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.invoice}
    <Header title="Invoice number {data.invoice.invoiceNum}" />
    <div class="flex">
        <InvoiceEmployee invoice={data.invoice} classes="min-w-64 border-2 dark:border-primary-950 border-primary-50" />
        <div class="flex flex-col border-e-2 border-y-2 dark:border-primary-950 border-primary-50 border-t-2 min-w-64"> 
            {#if data.customer}
                <User user={data.customer} classes="px-2 pt-2" />
            {/if}
            {#if data.address}
                <Address address={data.address} classes='px-2'/>
            {/if}
        </div>
    </div>
{/if}