<script lang="ts">
	import Address from '$lib/displayComponents/Address.svelte';
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
    <div class="flex border-primary-50 border-2 dark:border-primary-950">
        <RefundRecordDisplay refundRecord={data.refundRecord} classes='border-primary-50 border-e-2 dark:border-primary-950'/>
        {#if customer}
            <div class="flex flex-col p-2 border-primary-50 border-e-2 dark:border-primary-950">
                <User user={customer} classes=''/>
                {#if data.address}
                    <Address address={data.address} />
                {/if}
            </div>

        {/if}
        {#if data.paymentRecord}
            <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='border-primary-50 border-e-2 dark:border-primary-950'/>
        {/if}
        {#if data.invoice}
            <InvoiceEmployee invoice={data.invoice} />
        {/if}
    </div>
{/if}

