<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import NewInvoiceForm from '$lib/forms/NewInvoiceForm.svelte';
	import Header from '$lib/Header.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
   import { fade } from 'svelte/transition';
	import AddressForm from '$lib/forms/AddressForm.svelte';

   let { data }: { data: PageData } = $props();
   let registerFormModalOpen = $state(false);
   let addressFormModalOpen = $state(false);
   if(data.customer && !data.customer.emailVerified){
      registerFormModalOpen = true;
   }
</script>

<Header title="New Invoice" />


<div class="mt-14 sm:mt-10 mb-8" in:fade={{duration:600}} out:fade={{duration:0}}>
   {#if data.customer}
   <Modal
      open={addressFormModalOpen}
      onOpenChange={(event) => {
         addressFormModalOpen = event.open
      }}
      contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl"
      backdropClasses="backdrop-blur-xs"
   >
      {#snippet content()}
         <AddressForm data={data.addressForm} userId={data.customer?.id} bind:addressModalOpen={addressFormModalOpen}/>
         <button type="button" class="btn preset-filled-primary-50-950" onclick={()=> addressFormModalOpen=false}>Close</button>
      {/snippet}
   </Modal>
      <div class="m-2 rounded-lg border border-primary-50-950 grid sm:grid-cols-2">
         {#if data.lease}
            <LeaseEmployee lease={data.lease} classes='p-2'/>
         {/if}
         <div class="p-2">
            <UserEmployee user={data.customer} />
            {#if data.address}
               <AddressEmployee address={data.address} />
            {:else}
               <button type="button" class="btn preset-filled-primary-50-950" onclick={()=>addressFormModalOpen=true}>Add address</button>
            {/if}
         </div>
      </div>
      <NewInvoiceForm 
         data={data.newInvoiceForm}
         registerFormData={data.registerForm}
         emailVerificationFormData={data.emailVerificationForm}
         employeeId={data.user!.id}
         leases={data.leases} 
         customer={data.customer} 
         classes=''
         lease={data.lease}
      />
   {:else}
      <NewInvoiceForm 
         data={data.newInvoiceForm}
         registerFormData={data.registerForm}
         emailVerificationFormData={data.emailVerificationForm}
         employeeId={data.user!.id}
         leases={data.leases}
         lease={data.lease}
         customers={data.customers}
         classes='m-2'
      />
      
   {/if}
</div>
