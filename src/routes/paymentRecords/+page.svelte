<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
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
	import { fade } from 'svelte/transition';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';

    let { data }: { data: PageData } = $props();
    let { form, enhance, message } = superForm(data.searchForm,{
        onChange(event){
            const inputText = event.get('search')
            if(inputText){
                search=inputText!;
            }
        },
        onSubmit(input) {
            input.cancel();
            const inputText = input.formData.get('search')?.toString();
            if(search){
                search=inputText!;
            }
        },
    });
    let pageNum = $state(1);
    let size = $state(25);
    let search = $state('')
    let slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
    let searchResult = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search) ))
</script>

<Header title='Payment Records' />
{#await data.paymentRecords}
    loading {data.paymentCount} payment records ...
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
{:then paymentRecords} 
    <div transition:fade={{duration:600}}>
        <FormMessage message={$message} />
        <form method="post" use:enhance>
            <input type="search" name="search" id="search" class="input" placeholder="Search by payment record number" bind:value={$form.search}>
            <button class="btn">Submit</button>
            <button class="btn" onclick={()=> { search=''; $form.search=''; }}>Clear</button>
        </form>
        {#each slicedSource(searchResult(paymentRecords)) as paymentRecord}
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
                    <option value={paymentRecords.length}>Show all {paymentRecords.length} payment records</option>
            </select>
            <Pagination data={paymentRecords} bind:page={pageNum} bind:pageSize={size} siblingCount={4} >
                {#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
                {#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
                {#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
                {#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
                {#snippet labelLast()}<IconLast class="size-4" />{/snippet}
            </Pagination>
        </footer>
    </div>
{/await}