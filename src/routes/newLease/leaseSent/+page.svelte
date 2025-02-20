<script lang="ts">
    import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
	import { PUBLIC_ANVIL_EMAIL, PUBLIC_COMPANY_NAME } from '$env/static/public';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
</script>
<Header title='Lease Sent' />
<div class="mx-1 sm:mx-2 mt-10">
    <span>Your lease has been sent to {data.customer?.email} from {PUBLIC_ANVIL_EMAIL}</span>
    <span>Leases are valid when both parties have signed. {PUBLIC_COMPANY_NAME} will sign your lease during normal business hours.</span>
</div>
{#if data.paymentRecord}
    <PaymentRecordCustomer paymentRecord={data.paymentRecord} classes='m-2 w-72 border border-primary-50 dark:border-primary-950 rounded-lg'/>
{/if}