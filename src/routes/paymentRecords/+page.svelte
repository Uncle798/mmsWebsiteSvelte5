<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import type { PaymentRecord } from '@prisma/client';
	import Header from '$lib/Header.svelte';
	import PaymentRecordComponent from '$lib/displayComponents/PaymentRecord.svelte';
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import User from '$lib/displayComponents/User.svelte';
    import IconArrowLeft from 'lucide-svelte/icons/arrow-left';
    import IconArrowRight from 'lucide-svelte/icons/arrow-right';
    import IconEllipsis from 'lucide-svelte/icons/ellipsis';
    import IconFirst from 'lucide-svelte/icons/chevrons-left';
    import IconLast from 'lucide-svelte/icons/chevron-right';
	import { blur } from 'svelte/transition';

    let { data }: { data: PageData } = $props();
    let { form, enhance } = superForm(data.searchForm,{
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
    <div transition:blur={{duration:600}}>
    <form method="post" use:enhance>
        <input type="search" name="search" id="search" class="input" placeholder="Search by payment record number" bind:value={$form.search}>
        <button class="btn">Submit</button>
        <button class="btn" onclick={()=> goto('/users', {invalidateAll: true})}>Clear</button>
    </form>
    {#each slicedSource(data.paymentRecords) as paymentRecord}
        {@const { customer } = paymentRecord }
        <div class="flex">
            <PaymentRecordComponent paymentRecord={paymentRecord} />
            {#if customer}
            <User user={customer} />
            {/if}
        </div>
    {/each}
    <footer class="flex justify-start">
        <select name="size" id="size" class='select max-w-[350px]' bind:value={size}>
            {#each [5,10,25,50] as v}
                <option value={v}>Show {v} payment records per page</option>
            {/each}
                <option value={data.paymentRecords.length}>Show all {data.paymentRecords.length} payment records</option>
        </select>
        <Pagination data={data.paymentRecords} bind:page={pageNum} bind:pageSize={size} siblingCount={4} >
            {#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
            {#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
            {#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
            {#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
            {#snippet labelLast()}<IconLast class="size-4" />{/snippet}
        </Pagination>
    </footer>
</div>
{/if}