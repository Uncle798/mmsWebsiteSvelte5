<script lang="ts">
	import Address from '$lib/displayComponents/Address.svelte';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
    import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
    import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.user?.employee}
    {#if data.invoice}      
        <Header title="Invoice number {data.invoice.invoiceNum}" />
        <div class="flex flex-col sm:flex-row gap-x-1 mx-1 sm:mx-2 mt-10 border-2 dark:border-primary-950 border-primary-50 rounded-lg">
            <InvoiceEmployee invoice={data.invoice} classes="min-w-64 " />
            <div class="flex flex-col min-w-64"> 
                {#if data.customer}
                    <UserEmployee user={data.customer} classes="px-2 pt-2" />
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
        <div class="flex flex-col sm:flex-row gap-x-1 mx-1 sm:mx-2 mt-10 border-2 dark:border-primary-950 border-primary-50 rounded-lg">
            <InvoiceCustomer invoice={data.invoice} classes="min-w-64 " />
            <div class="flex flex-col dark:border-primary-950 border-primary-50 border rounded-lg min-w-64"> 
                {#if data.customer}
                    <UserEmployee user={data.customer} classes="px-2 pt-2" />
                {/if}
                {#if data.address}
                    <Address address={data.address} classes='px-2'/>
                {/if}
            </div>
        </div>
    {/if}
{/if}