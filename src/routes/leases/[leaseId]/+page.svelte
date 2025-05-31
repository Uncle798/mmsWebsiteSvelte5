<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseCustomer from '$lib/displayComponents/customerViews/LeaseCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

<Header title='Lease {data.lease?.leaseId}' />
{#if data.user?.employee}   
   <div class="grid sm:grid-cols-2 m-1 sm:m-2 border-2 border-primary-50-950 rounded-lg">
      {#if data.lease}
         <LeaseEmployee lease={data.lease} classes='border-b border-primary-50-950'/>
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
{:else}
   <div class="flex flex-col sm:flex-row mt-10 mx-1 sm:mx-2">
      {#if data.lease}
         <LeaseCustomer lease={data.lease} />
      {/if}
      {#if data.customer}
         <UserCustomer user={data.customer} />
      {/if}
   </div>
{/if}