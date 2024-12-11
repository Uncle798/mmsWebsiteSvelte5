<script lang="ts">
    import NewInvoiceForm from '$lib/forms/NewInvoiceForm.svelte';
    import type { PageData } from './$types';
    import { blur, fade } from 'svelte/transition';

    let { data }: { data: PageData } = $props();
</script>
<div transition:blur={{duration:600}}>
    <NewInvoiceForm data={data.newInvoiceForm} employeeId={data.user?.id} customers={data.customers} leases={data.leases} registerForm={data.registerForm}/>

</div>