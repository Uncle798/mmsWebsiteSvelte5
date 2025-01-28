<script lang="ts">
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
    import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.refundRecord}
    {@const customer = data.refundRecord.customer}
    <Header title='Refund Record number: {data.refundRecord.refundNumber}' />
    <div class="flex">
        <RefundRecordDisplay refundRecord={data.refundRecord}/>
        {#if customer}
            <User user={customer} />
        {/if}
        {#if data.paymentRecord}
            <PaymentRecordEmployee paymentRecord={data.paymentRecord} />
        {/if}
        {#if data.invoice}
            <InvoiceEmployee invoice={data.invoice} />
        {/if}
    </div>
{/if}

