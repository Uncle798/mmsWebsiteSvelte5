<script lang="ts">
	import Address from '$lib/displayComponents/Address.svelte';
	import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
    import RefundRecordEmployee from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.refundRecord}
    {@const customer = data.refundRecord.customer}
    <Header title='Refund Record number: {data.refundRecord.refundNumber}' />
    <div class="m-2 border border-primary-50 dark:border-primary-950 rounded-lg grid grid-cols-1 lg:grid-cols-2">
        <div class="mb-2 sm:grid sm:grid-cols-2">
            <RefundRecordEmployee refundRecord={data.refundRecord} classes=''/>
            {#if customer}
                <div class="flex flex-col p-2">
                    <UserEmployee user={customer} classes=''/>
                    {#if data.address}
                        <Address address={data.address} />
                    {/if}
                </div>
    
            {/if}
        </div>
        <HorizontalDivider />
        <div class="sm:flex">
            {#if data.paymentRecord}
                <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='sm:w-1/2'/>
            {/if}
            {#if data.invoice}
                <InvoiceEmployee invoice={data.invoice} />
            {/if}
        </div>
    </div>
{/if}

