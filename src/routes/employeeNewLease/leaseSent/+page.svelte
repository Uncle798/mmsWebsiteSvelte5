<script lang="ts">
    import Header from '$lib/Header.svelte';
    import { PUBLIC_ANVIL_EMAIL, PUBLIC_COMPANY_NAME } from '$env/static/public';
    import type { PageData } from './$types';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';

    let { data }: { data: PageData } = $props();
</script>
<Header title='Lease Sent' />
<div class='m-2'>Your lease has been sent to {data.customer?.email} from {PUBLIC_ANVIL_EMAIL}.  Leases are valid when both parties have signed. {PUBLIC_COMPANY_NAME} will sign your lease during normal business hours.</div>
{#if data.paymentRecord}
    <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='w-72 m-2 rounded-lg border border-primary-50 dark:border-primary-950'/>
{/if}