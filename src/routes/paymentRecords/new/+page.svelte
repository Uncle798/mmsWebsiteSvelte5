<script lang="ts">
    import NewPaymentRecordForm from '$lib/forms/NewPaymentRecordForm.svelte';
import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div>
    <NewPaymentRecordForm 
        data={data.newPaymentRecordForm} 
        registerForm={data.registerForm} 
        invoices={data.invoices} 
        customers={data.customers}
        employeeId={data.user?.id}
    />
</div>