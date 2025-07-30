<script lang="ts">
    import NewPaymentRecordForm from '$lib/forms/NewPaymentRecordForm.svelte';
    import type { PageData } from './$types';
    import { fade } from 'svelte/transition';
	import Header from '$lib/Header.svelte';

    let { data }: { data: PageData } = $props();
</script>

<Header title='New Payment Record' />
<div in:fade={{duration:600}} out:fade={{duration:0}} class="mt-14 sm:mt-10 mx-1 sm:mx-2 mb-9">
   <NewPaymentRecordForm 
      data={data.newPaymentRecordForm} 
      invoices={data.invoices} 
      employeeId={data.user?.id}
      leases={data.leases}
      invoiceForm={data.invoiceForm}
      registerForm={data.registerForm}
      customer={data.customer}
      invoice={data.invoice}
      emailVerificationFormData={data.emailVerificationForm}
      customers={data.customers}
      customerInvoices={data.customerInvoices}
   />
</div>