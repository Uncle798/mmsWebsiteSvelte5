<script lang="ts">
    import NewInvoiceForm from '$lib/forms/NewInvoiceForm.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<NewInvoiceForm data={data.newInvoiceForm} employeeId={data.user?.id} customers={data.customers} leases={data.leases}/>