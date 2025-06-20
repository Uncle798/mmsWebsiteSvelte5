<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
	import RefundRecordCustomer from '$lib/displayComponents/customerViews/RefundRecordCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
    import RefundRecordEmployee from '$lib/displayComponents/RefundRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Header from '$lib/Header.svelte';
    import EmailCustomer from '$lib/emailCustomer.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.refundRecord}
    {@const customer = data.refundRecord.customer}
    <Header title='Refund Record number: {data.refundRecord.refundNumber}' />
    <div class="m-2 mt-10 border border-primary-50 dark:border-primary-950 rounded-lg grid grid-cols-1 lg:grid-cols-2 mb-22 sm:mb-14 lg:mb-9">
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
        {#if customer.email && customer.emailVerified}
            <EmailCustomer
                emailAddress={customer.email}
                recordNum={data.refundRecord.refundNumber}
                apiEndPoint='/api/sendRefund'
                buttonText='Send Refund email'
                classes='mx-2'
            />
        {/if}
    </div>
{/if}

