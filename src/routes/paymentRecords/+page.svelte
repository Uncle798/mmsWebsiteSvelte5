<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
    import type { PageData } from './$types';
	import type { PaymentRecord } from '@prisma/client';
	import Header from '$lib/Header.svelte';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import { fade } from 'svelte/transition';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import Placeholder from '$lib/displayComponents/Placeholder.svelte';
	import Search from '$lib/forms/Search.svelte';

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
    let searchedPaymentRecords = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search) ))
</script>

<Header title='Payment Records' />
{#await data.paymentRecords}
    loading {data.paymentCount} payment records
    {#if data.years}
        Select year: 
        {#each data.years as year}
        <a href="/paymentRecords/year/{year}" class="btn">{year}</a>
        {/each}
    {/if}
    <Placeholder/>
{:then paymentRecords} 
    {#await data.customers}
        loading customers
    {:then customers} 
        <div transition:fade={{duration:600}}>
            <FormMessage message={$message} />
            <Search search={search} searchType='payment records' data={data.searchForm}/>
            {#each slicedSource(searchedPaymentRecords(paymentRecords)) as paymentRecord}
            {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId) }
            <div class="flex">
                <PaymentRecordEmployee paymentRecord={paymentRecord} />
                {#if customer}
                    <User user={customer} />
                {/if}
            </div>
            {/each}
        </div>
        <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedPaymentRecords(paymentRecords)} label='payment records'/>
    {/await}
{/await}