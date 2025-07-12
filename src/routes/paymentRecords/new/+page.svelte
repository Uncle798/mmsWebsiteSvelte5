<script lang="ts">
    import NewPaymentRecordForm from '$lib/forms/NewPaymentRecordForm.svelte';
    import type { PageData } from './$types';
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import { fade } from 'svelte/transition';
    import RegisterForm from '$lib/forms/RegisterForm.svelte';

    let { data }: { data: PageData } = $props();
    let registerFormModalOpen = $state(false);
    let customerSelected = $state(false)
</script>

<Modal
   bind:open={registerFormModalOpen}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
   backdropClasses="backdrop-blur-xs"
>
    {#snippet content()}
        <RegisterForm data={data.registerForm} registerFormModalOpen={registerFormModalOpen} formType='employee'/>
        <button class="btn" onclick={()=>registerFormModalOpen=false}>Cancel</button>
    {/snippet}
</Modal>

<div in:fade={{duration:600}} out:fade={{duration:0}} class="mt-12 sm:mt-10 mx-1 sm:mt-12 sm:mt-10 sm:mx-2">
   {#if !customerSelected}
      <button class="btn preset-filled-primary-50-950 rounded-lg" type="button" onclick={()=>registerFormModalOpen = true}>Create New Customer</button>
   {/if}
   <NewPaymentRecordForm 
      data={data.newPaymentRecordForm} 
      invoices={data.invoices} 
      customers={data.customers}
      employeeId={data.user?.id}
      leases={data.leases}
      invoiceForm={data.invoiceForm}
      defaultCustomer={data.defaultCustomer}
      defaultInvoice={data.defaultInvoice}
      bind:customerSelected={customerSelected}
   />
</div>