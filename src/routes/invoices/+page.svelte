<script lang="ts">
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
	import User from '$lib/displayComponents/User.svelte';
	import type { Invoice } from '@prisma/client';
	import { superForm } from 'sveltekit-superforms';
    import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import { Heart } from 'lucide-svelte';
	import Header from '$lib/Header.svelte';
    import { Pagination } from '@skeletonlabs/skeleton-svelte';

    let { data }: { data: PageData } = $props();
    let pageNum = $state(1);
    let size = $state(25);
    let search = $state('');
    let { form, enhance, } = superForm(data.searchForm, {
        onChange(event){
            search = event.get('search')
        }
    })
    let slicedSource = $derived((invoices:Invoice[]) => invoices.slice((pageNum-1)*size, pageNum*size));
    let searchedInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => invoice.invoiceNum.toString().includes(search)))
</script>
<Header title='All invoices' />
{#await data.invoices}
    Loading {data.invoiceCount} invoices, 
    {#if data.years}
        or select year: 
        {#each data.years as year}
            <a href="/invoices/year/{year}" class="btn">{year.toString()},</a>
        {/each}
    {/if}
    or:
        <a href="/invoices/unpaid" class="btn">Unpaid invoices</a>

    <div class="w-full space-y-4">
        <div class="space-y-4">
            <div class="placeholder animate-pulse m-4"></div>
            <div class="grid grid-cols-4 gap-4 m-4">
            <div class="placeholder animate-pulse"></div>
            <div class="placeholder animate-pulse"></div>
            <div class="placeholder animate-pulse"></div>
            <div class="placeholder animate-pulse"></div>
            </div>
        </div>
        </div>
{:then invoices} 
    <form method="POST" use:enhance>
        <div>
            <label class="label-text">Search by invoice number
                <input type="search" name="search" id="search" class="input" placeholder="Search by invoice number...">
                <button class="btn" type="button" onclick={()=> {$form.search = ''; search='' }}>Clear</button>
            </label>
        </div>
    </form>

    {#each invoices as invoice}    
    {@const {customer} = invoice}
    <div class="flex" transition:fade={{duration:600}}>
        <InvoiceEmployee invoice={invoice} />
        {#if customer}
            <User user={customer} />
        {/if}
    </div>
    {/each}
    <footer class="flex justify-between">
        <select name="size" id="size" class="select" bind:value={size}>
            {#each [5,10,25,50] as v}
            <option value={v}>Show {v} units per page</option>
            {/each}
            <option value={searchedInvoices(invoices).length}>Show all {searchedInvoices(invoices).length} units</option>
        </select>
        <Pagination data={searchedInvoices(invoices)} bind:page={pageNum} bind:pageSize={size} alternative/>
    </footer>
{/await}