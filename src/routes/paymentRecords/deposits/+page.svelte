<script lang="ts">
    import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import Header from '$lib/Header.svelte';
    import { Modal } from '@skeletonlabs/skeleton-svelte'
    import type { PageData } from './$types';
    import type { PaymentRecord } from '@prisma/client';
	import RefundForm from '$lib/forms/NewRefundForm.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
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
    let slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
    let searchedPaymentRecords = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search) )) 
    let paymentRecord=$state<PaymentRecord>({} as PaymentRecord);
    function refundModal(deposit:PaymentRecord) {
        paymentRecord = deposit;
        refundModalOpen = true;
    }
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
    loading deposits
{:then deposits} 
    <Search search={search} searchType='invoice number' data={data.searchForm} />
    {#each slicedSource(searchedPaymentRecords(deposits)) as deposit}
        <PaymentRecordEmployee paymentRecord={deposit} />
        <button type="button" class="btn" onclick={() => refundModal(deposit)}>Refund this deposit</button>
    {/each}
    <Pagination pageNum={pageNum} size={size} array={searchedPaymentRecords(deposits)} label='invoices'/>
{/await}