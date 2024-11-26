<script lang="ts">
   import Address from '$lib/displayComponents/Address.svelte';
	import Invoice from '$lib/displayComponents/Invoice.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import AddressForm from '$lib/forms/AddressForm.svelte';
   import { Modal } from '@skeletonlabs/skeleton-svelte';
   import User from '$lib/displayComponents/User.svelte';
   import type { PageData } from './$types';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';

   let { data }: { data: PageData } = $props();
   let addressModalOpen = $state(false);
   let leaseEndModalOpen = $state(false)
</script>

{#if data.dbUser}
   <User user={data.dbUser}/>
{:else}
...loading user
{/if}
{#if data.address}
   <Address bind:address={data.address}/>
   <Modal
      bind:open={addressModalOpen}
      triggerBase="btn preset-tonal "
      contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
      backdropClasses="backdrop-blur-sm"
   >
   {#snippet trigger()}
      Change Address
   {/snippet}
   {#snippet content()}
      <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.dbUser?.id!}/>
      <button class="btn" onclick={()=>addressModalOpen=false}>Close</button>
   {/snippet}
   </Modal>
{:else}
   ...loading address
{/if}


{#if !data.leases}
   ...loading leases
{:else if data.leases}
      {#each data.leases as lease}
         <LeaseEmployee lease={lease} />
         {#if !lease?.leaseEnded}
            <Modal
               bind:open={leaseEndModalOpen}
               triggerBase="btn preset-tonal "
               contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
               backdropClasses="backdrop-blur-sm"
            >  
            {#snippet trigger()}
               End Lease
            {/snippet}
            {#snippet content()}
               <LeaseEndForm data={data.leaseEndForm} leaseId={lease.leaseId} leaseEndModalOpen={leaseEndModalOpen}/>
            {/snippet}   
            </Modal>
         {/if}
      {/each}
{/if}

{#if !data.invoices}
   ...loading invoices
{:else if data.invoices}
      {#each data.invoices as invoice}
         <Invoice invoice={invoice} />
      {/each}
{/if}
