<script lang="ts">
    import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import Header from '$lib/Header.svelte';
    import { Modal } from '@skeletonlabs/skeleton-svelte'
    import type { PageData } from './$types';
    import type { PaymentRecord } from '@prisma/client';
	import RefundForm from '$lib/forms/NewRefundForm.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
    interface Props {
        data: PageData;
    }
    let { 
        data, 
    }: Props = $props();
    let refundModalOpen=$state(false); 
    let pageNum = $state(1);
    let size = $state(25);
    let search = $state('');
    let noteSearch = $state('');
    const numberFormatter = new Intl.NumberFormat('en-US');
    let slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
    let searchedPaymentRecords = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search) )) 
    const searchByNotes = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNotes?.includes(noteSearch)));
    let paymentRecord=$state<PaymentRecord>({} as PaymentRecord);
    function refundModal(deposit:PaymentRecord) {
        paymentRecord = deposit;
        refundModalOpen = true;
    }
    let totalRevenue = $derived((paymentRecords:PaymentRecord[]) => {
        let totalRevenue = 0;
        paymentRecords.forEach((paymentRecord) => {
            if(paymentRecord.paymentCompleted && !paymentRecord.refunded){
                totalRevenue += paymentRecord.paymentAmount
            }
        })
        return totalRevenue;
    })
</script>
<Header title='Deposits' />
<Modal
   bind:open={refundModalOpen}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
   backdropClasses=""
>  
{#snippet content()}
   <RefundForm data={data.refundForm} paymentRecord={paymentRecord}/>
   <button class="btn" onclick={()=>refundModalOpen = false}>Close</button>
{/snippet}

</Modal>

{#await data.deposits}
    loading {numberFormatter.format(data.depositCount)} deposits
{:then deposits} 
    <div class="flex m-2">
        <Search bind:search={search} searchType='payment record number' data={data.searchForm} classes='w-1/2'/>
        <Search bind:search={noteSearch} searchType='Payment notes' data={data.searchForm} classes='w-1/2'/>

    </div>
    <HorizontalDivider />
    <Revenue amount={totalRevenue(searchedPaymentRecords(deposits))} label='Amount of deposits: ' />
    <HorizontalDivider />
    <div class="flex flex-col">
        {#each slicedSource(searchedPaymentRecords(searchByNotes(deposits))) as deposit}
        <div class="flex flex-col border-y-2 dark:border-primary-950 border-primary-50">
            <PaymentRecordEmployee paymentRecord={deposit} classes='px-2'/>
            <button type="button" class="btn rounded-lg preset-filled-primary-50-950 m-2" onclick={() => refundModal(deposit)}>Refund this deposit</button>
        </div>
        {/each}
        <Pagination pageNum={pageNum} size={size} array={searchedPaymentRecords(deposits)} label='invoices'/>
    </div>
{/await}