<script lang="ts">
    import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
	import { PUBLIC_ANVIL_EMAIL, PUBLIC_COMPANY_NAME } from '$env/static/public';
</script>
<Header title='Lease Sent' />
<span>Your lease has been sent to {data.customer?.email} from {PUBLIC_ANVIL_EMAIL}</span>
<span>Leases are valid when both parties have signed. {PUBLIC_COMPANY_NAME} will sign your lease during normal business hours.</span>