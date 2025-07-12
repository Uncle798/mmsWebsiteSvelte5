<script lang="ts">
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';
   import NewInvoiceForm from '$lib/forms/NewInvoiceForm.svelte';
	import RegisterForm from '$lib/forms/RegisterForm.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
   import { Modal } from '@skeletonlabs/skeleton-svelte';
   import { fade } from 'svelte/transition';

   let { data }: { data: PageData } = $props();
   let registerFormModalOpen = $state(false);
   if(data.customer && !data.customer[0].emailVerified){
      registerFormModalOpen = true;
   }
</script>


<Modal
   bind:open={registerFormModalOpen}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
   backdropClasses="backdrop-blur-xs"
>
   {#snippet content()}
      {#if data.customer}     
         <EmailVerificationForm data={data.emailVerificationForm} userId={data.customer[0].id} redirect='false' bind:emailVerificationModalOpen={registerFormModalOpen}/>
      {:else}
         <RegisterForm data={data.registerForm} registerFormModalOpen={registerFormModalOpen} formType='employee' redirectTo='invoices/new' />
         <button class="btn preset-filled-primary-50-950 rounded-lg h-fit" onclick={()=>registerFormModalOpen=false}>Cancel</button>
      {/if}
   {/snippet}
</Modal>
<Header title="New Invoice" />
{#if data.customers}   
   <div in:fade={{duration:600}} out:fade={{duration:0}} class="mt-12 sm:mt-10">
      <button class="btn preset-filled-primary-50-950 rounded-lg m-2" type="button" onclick={()=>registerFormModalOpen = true}>Create New Customer</button>
      <div class="mx-2">Or,</div>
      {#if data.customers}
         <NewInvoiceForm data={data.newInvoiceForm} employeeId={data.user?.id} customers={data.customers} leases={data.leases} classes='px-2'/>
      {/if}
   </div>
{:else if data.customer}
   <NewInvoiceForm data={data.newInvoiceForm} employeeId={data.user?.id} customers={data.customer} leases={data.leases} defaultCustomer={data.customer[0].id} classes='mt-12 sm:mt-10 m-1 sm:m-2'/>
{/if}