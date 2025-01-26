<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import type { PaymentRecord } from '@prisma/client';
	import Header from '$lib/Header.svelte';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import { fade } from 'svelte/transition';
	import Search from '$lib/forms/Search.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';

    let { data }: { data: PageData } = $props();
    let pageNum = $state(1);
    let size = $state(25);
    let search = $state('')
    let slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
    let searchedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search) ))
</script>

<Header title='Payment Records' />
{#await data.paymentRecords}
    loading {data.paymentRecordCount} payment records ...
    <Placeholder />
{:then paymentRecords} 
    {#await data.customers}
        loading customers
    {:then customers} 
          <div transition:fade={{duration:600}}>  
            <Search search={search} searchType='payment records' data={data.searchForm}/>      
            {#each slicedSource(searchedPayments(paymentRecords)) as paymentRecord}
            {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId) }
            <div class="flex">
                <PaymentRecordEmployee paymentRecord={paymentRecord} />
                {#if customer}
                    <User user={customer} />
                {/if}
            </div>
            {/each}
            <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedPayments(paymentRecords)} label='payment records'/>
        </div>
    {/await}
{/await}