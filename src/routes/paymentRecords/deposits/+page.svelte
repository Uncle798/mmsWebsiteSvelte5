<script lang="ts">
    import PaymentRecord from '$lib/displayComponents/PaymentRecord.svelte';
	import Header from '$lib/Header.svelte';
    import { Modal } from '@skeletonlabs/skeleton-svelte'
    import type { PageData } from './$types';
	import RefundForm from '$lib/forms/NewRefundForm.svelte';
    import { Tipex } from '@friendofsvelte/tipex';
    interface Props {
        data: PageData;
    }
    let { 
        data, 
    }: Props = $props();
    let refundModalOpen=$state(false); 
    let body=$state(''); 
    let refundAmount=$state(0);
    let paymentRecordNumber=$state(0);
</script>
<Header title='Deposits' />
<Modal
   bind:open={refundModalOpen}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
   backdropClasses=""
>  
{#snippet content()}
   <RefundForm data={data.refundForm} notes={body} amount={refundAmount} {paymentRecordNumber}/>
   <button class="btn" onclick={()=>refundModalOpen = false}>Close</button>
{/snippet}

</Modal>
{#if data.deposits.length === 0}
    No deposits
{/if}
{#each data.deposits as deposit}
    <PaymentRecord paymentRecord={deposit}/>
    <button class="btn" 
        onclick={()=>{
            refundModalOpen=true; 
            body=deposit.paymentNotes ? deposit.paymentNotes : '';
            refundAmount = deposit.paymentAmount;
            paymentRecordNumber = deposit.paymentNumber
        }}
    >
    Refund this deposit
    </button>
{/each}