<script lang="ts">
	import Address from '$lib/displayComponents/Address.svelte';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
    import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
    import User from '$lib/displayComponents/User.svelte';
	import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.user?.employee}
    {#if data.invoice}      
        <Header title="Invoice number {data.invoice.invoiceNum}" />
        <div class="flex gap-x-1 p-2">
            <InvoiceEmployee invoice={data.invoice} classes="min-w-64 border dark:border-primary-950 border-primary-50 rounded-xl" />
            <div class="flex flex-col dark:border-primary-950 border-primary-50 border rounded-lg min-w-64"> 
                {#if data.customer}
                    <User user={data.customer} classes="px-2 pt-2" />
                {/if}
                {#if data.address}
                    <Address address={data.address} classes='px-2'/>
                {/if}
            </div>
        </div>
    {/if}
{:else}
    {#if data.invoice}
        <Header title="Invoice number {data.invoice.invoiceNum}" />
        <div class="flex gap-x-1 p-2">
            <InvoiceCustomer invoice={data.invoice} classes="min-w-64 border dark:border-primary-950 border-primary-50 rounded-xl" />
            <div class="flex flex-col dark:border-primary-950 border-primary-50 border rounded-lg min-w-64"> 
                {#if data.customer}
                    <User user={data.customer} classes="px-2 pt-2" />
                {/if}
                {#if data.address}
                    <Address address={data.address} classes='px-2'/>
                {/if}
            </div>
        </div>
    {/if}
{/if}