<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import type { PaymentRecord } from '@prisma/client';
	import Header from '$lib/Header.svelte';
	import PaymentRecordComponent from '$lib/displayComponents/PaymentRecord.svelte';
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import User from '$lib/displayComponents/User.svelte';

    let { data }: { data: PageData } = $props();
    let { form, enhance } = superForm(data.paymentSearchForm,{
        onSubmit(input) {
            input.cancel();
            const search = input.formData.get('search')?.toString();
            if(search){
                goto(`/paymentRecords?search=${search}`)
            }
        },
    });
    let pageNum = $state(1);
    let size = $state(25);
    let slicedSource = $derived((s:PaymentRecord[]) => s.slice((pageNum -1) * size, pageNum*size));
</script>

<Header title='Payment Records' />

{#if !data.paymentRecords}
    ...loading payment records
{:else}
    <form method="post" use:enhance>
        <input type="search" name="search" id="search" class="input" placeholder="Search by payment record number" bind:value={$form.search}>
        <button class="btn">Submit</button>
        <button class="btn" onclick={()=> goto('/users', {invalidateAll: true})}>Clear</button>
    </form>
    {#each slicedSource(data.paymentRecords) as paymentRecord (paymentRecord.paymentId)}
        {@const customer = data.customers.find((customer) => customer.id === paymentRecord.customerId)}
        <div class="flex">

            <PaymentRecordComponent paymentRecord={paymentRecord} />
            {#if customer}
            <User user={customer} />
            {/if}
        </div>
    {/each}
    <footer class="flex justify-between">
        <select name="size" id="size" class='select' bind:value={size}>
            {#each [5,10,25,50] as v}
                <option value={v}>Show {v} users per page</option>
            {/each}
                <option value={data.paymentRecords.length}>Show all {data.paymentRecords.length} payment records</option>
        </select>
        <Pagination data={data.paymentRecords} bind:page={pageNum} bind:pageSize={size} count={data.paymentRecords.length} alternative />
    </footer>
{/if}