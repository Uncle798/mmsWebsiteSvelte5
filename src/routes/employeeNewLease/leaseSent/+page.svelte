<script lang="ts">
    import Header from '$lib/Header.svelte';
    import { PUBLIC_ANVIL_EMAIL, PUBLIC_COMPANY_NAME } from '$env/static/public';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
<Header title='Lease Sent' />
<span>Your lease has been sent to {data.customer?.email} from {PUBLIC_ANVIL_EMAIL}.  Leases are valid when both parties have signed. {PUBLIC_COMPANY_NAME} will sign your lease during normal business hours.</span>