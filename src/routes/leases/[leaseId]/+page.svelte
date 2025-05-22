<script lang="ts">
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
   <div class="flex mt-10 mx-1 sm:mx-2">
      {#if data.lease}
         <LeaseEmployee lease={data.lease} classes='mx-2 border rounded-lg p-2'/>
      {/if}
      {#if data.customer}
         <UserEmployee user={data.customer} classes='mx-2 border rounded-lg p-2'/>
      {/if}
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