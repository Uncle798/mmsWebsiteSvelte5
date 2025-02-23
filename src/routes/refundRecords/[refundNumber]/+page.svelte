<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import RefundRecordCustomer from '$lib/displayComponents/customerViews/RefundRecordCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
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
    <div class="m-2 mt-10 border border-primary-50 dark:border-primary-950 rounded-lg grid grid-cols-1 lg:grid-cols-2">
        <div class="mb-2 sm:grid sm:grid-cols-2">
            {#if data.user?.employee}
                <RefundRecordEmployee refundRecord={data.refundRecord} classes=''/>
            {:else}
                <RefundRecordCustomer refundRecord={data.refundRecord} />
            {/if}
            {#if customer}
                <div class="flex flex-col p-2">
                    {#if data.user?.employee}
                        <UserEmployee user={customer} classes=''/>
                    {:else}
                        <UserCustomer user={customer} />
                    {/if}
                    {#if data.address}
                        {#if data.user?.employee}
                            <AddressEmployee address={data.address} />
                        {:else}
                            <AddressCustomer address={data.address} />
                        {/if}
                    {/if}
                </div>
            {/if}
        </div>
        <HorizontalDivider />
        <div class="sm:flex">
            {#if data.paymentRecord}
                {#if data.user?.employee}
                    <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='sm:w-1/2'/>
                {:else}
                    <PaymentRecordCustomer paymentRecord={data.paymentRecord} />
                {/if}
            {/if}
            {#if data.invoice}
                {#if data.user?.employee}
                    <InvoiceEmployee invoice={data.invoice} />
                {:else}
                    <InvoiceCustomer invoice={data.invoice} />
                {/if}
            {/if}
        </div>
    </div>
{/if}

