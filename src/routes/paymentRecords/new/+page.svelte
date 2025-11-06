<script lang="ts">
    import NewPaymentRecordForm from '$lib/forms/NewPaymentRecordForm.svelte';
    import type { PageData } from './$types';
    import { fade } from 'svelte/transition';
	import Header from '$lib/Header.svelte';
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';

    let { data }: { data: PageData } = $props();
</script>

<Header title='New Payment Record' />
<div in:fade={{duration:600}} out:fade={{duration:0}} class="mt-14 sm:mt-10 mx-1 sm:mx-2 mb-8">
    {#if data.invoice}
        <div class="border border-primary-50-950 rounded-lg grid grid-cols-1 sm:grid-cols-2 my-2 gap-2">
            <InvoiceEmployee invoice={data.invoice} classes='mx-2'/>
            <div>
                {#if data.customer}
                <UserEmployee user={data.customer} />
                {/if}
                {#if data.address}
                <AddressEmployee address={data.address} />
                {/if}
            </div>
        </div>
    {/if}
    <NewPaymentRecordForm 
      data={data.newPaymentRecordForm} 
      invoices={data.invoices} 
      employeeId={data.user!.id}
      leases={data.leases}
      invoiceFormData={data.invoiceForm}
      registerFormData={data.registerForm}
      customer={data.customer}
      invoice={data.invoice}
      emailVerificationFormData={data.emailVerificationForm}
      customers={data.customers}
      paymentTypesCookie={data.paymentTypesCookie}
      newPaymentsCookie={data.newPaymentCookie}
   />
</div>