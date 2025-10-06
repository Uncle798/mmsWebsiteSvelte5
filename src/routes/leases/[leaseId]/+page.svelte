<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseCustomer from '$lib/displayComponents/customerViews/LeaseCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
   import type { PageData } from './$types';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
   import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';

   let { data }: { data: PageData } = $props();
   let modalOpen = $state(false);
</script>
<Header title='Lease {data.lease?.leaseId}' />
{#if  data.lease}   
   <Modal
      open={modalOpen}
      onOpenChange={(event) => 
         modalOpen = event.open
      }
      contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
      backdropClasses="backdrop-blur-xs"
   >
      {#snippet content()}
         <LeaseEndForm data={data.leaseEndForm} leaseId={data.lease!.leaseId} bind:leaseEndModalOpen={modalOpen}/>
         <button type="button" class="btn preset-filled-primary-50-950" onclick={()=> modalOpen = false}>Close</button>
      {/snippet}
   </Modal>
{/if}
{#if data.user?.employee}   
   <div class="mt-14 sm:mt-10 mb-8">
      {#if data.lease}
         <div class="border rounded-lg border-primary-50-950 flex flex-col sm:flex-row mx-2">
            <LeaseEmployee lease={data.lease} classes=''/>
            {#if !data.lease.leaseEnded}
            <button type="button" class="btn preset-filled-primary-50-950 m-2 h-8"  onclick={()=>{
               modalOpen = true;
            }}
            >End Lease</button>
            {/if}
            <div class="m-1 sm:m-2">
               {#if data.customer}
                  <UserEmployee user={data.customer} classes='mx-2'/>
               {/if}
               {#if data.address}
                  {#if data.currentAddress}
                  <label class="label-text">Lease Address:
                     <AddressEmployee address={data.address} classes='text-base mx-2' />
                  </label>
                  {:else}
                     <AddressEmployee address={data.address} classes='mx-2'/>
                  {/if}
               {/if}
               {#if data.currentAddress}
                  <label >Current address
                     <AddressEmployee address={data.currentAddress} classes='mx-2'/>
                  </label>
                  
               {/if}
            </div>
         </div>
      {/if}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
         {#each data.invoices as invoice}
            <div class="border border-primary-50-950 rounded-lg">
               <InvoiceEmployee invoice={invoice} classes='h-60 p-2'/>
               {#if !invoice.paymentRecordNum}
                  <a href="/paymentRecord/new?invoiceNum={invoice.invoiceNum}" class="btn preset-filled-primary-50-950 h-8 m-2">Make a payment record for this invoice</a>
               {/if}
            </div>
         {/each}
      </div>
   </div>
{:else}
   <div class="flex flex-col sm:flex-row mt-14 mx-1 sm:mx-2" in:fade={{duration:600}} out:fade={{duration:0}}>
      {#if data.lease}
         <LeaseCustomer lease={data.lease} />
      {/if}
      {#if data.customer}
         <UserCustomer user={data.customer} />
      {/if}
   </div>
{/if}