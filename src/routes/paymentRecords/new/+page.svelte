<script lang="ts">
    import NewPaymentRecordForm from '$lib/forms/NewPaymentRecordForm.svelte';
    import type { PageData } from './$types';
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import { fade } from 'svelte/transition';
    import RegisterForm from '$lib/forms/RegisterForm.svelte';

    let { data }: { data: PageData } = $props();
    let registerFormModalOpen = $state(false);
</script>

<Modal
   bind:open={registerFormModalOpen}
   triggerBase="btn preset-tonal"
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
   backdropClasses="backdrop-blur-sm"
>
    {#snippet content()}
        <RegisterForm data={data.registerForm} registerFormModalOpen={registerFormModalOpen} formType='employee'/>
        <button class="btn" onclick={()=>registerFormModalOpen=false}>Cancel</button>
    {/snippet}
</Modal>

<div transition:fade={{duration:600}}>
    <button class="btn" type="button" onclick={()=>registerFormModalOpen = true}>Create New Customer</button>
    <NewPaymentRecordForm 
        data={data.newPaymentRecordForm} 
        invoices={data.invoices} 
        customers={data.customers}
        employeeId={data.user?.id}
        leases={data.leases}
        invoiceForm={data.invoiceForm}
        defaultCustomer={data.defaultCustomer}
        defaultInvoice={data.defaultInvoice}
    />
</div>