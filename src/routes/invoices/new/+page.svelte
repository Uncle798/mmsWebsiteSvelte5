<script lang="ts">
   import NewInvoiceForm from '$lib/forms/NewInvoiceForm.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
   import { fade } from 'svelte/transition';

   let { data }: { data: PageData } = $props();
   let registerFormModalOpen = $state(false);
   if(data.customer && !data.customer.emailVerified){
      registerFormModalOpen = true;
   }
</script>

<Header title="New Invoice" />
{#if data.customers}   
   <div in:fade={{duration:600}} out:fade={{duration:0}} class="mt-14 sm:mt-10">
      <NewInvoiceForm 
         data={data.newInvoiceForm} 
         employeeId={data.user?.id} 
         customers={data.customers} 
         leases={data.leases}
         registerFormData={data.registerForm}
         emailVerificationFormData={data.emailVerificationForm}
         classes='px-2'
      />
   </div>
{:else if data.customer}
   <div class="mt-14 sm:mt-10" in:fade={{duration:600}} out:fade={{duration:0}}>
      <NewInvoiceForm 
         data={data.newInvoiceForm}
         registerFormData={data.registerForm}
         emailVerificationFormData={data.emailVerificationForm}
         employeeId={data.user?.id}
         leases={data.leases} 
         defaultCustomer={data.customer} 
         classes='mt-14 sm:mt-10 m-1 sm:m-2'
      />
   </div>
{/if}