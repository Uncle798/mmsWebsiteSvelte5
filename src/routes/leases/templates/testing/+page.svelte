<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
</script>
<div class="mt-14 sm:mt-12 mb-8 mx-2 w-screen h-screen">
   <div class="flex flex-col">
      {#if data.customer}
         <UserEmployee user={data.customer} />
      {/if}
      {#if data.address}
         <AddressEmployee address={data.address} />
      {/if}
   </div>
   {#if data.lease}
      <LeaseEmployee lease={data.lease} />
   {/if}
   {#if data.contract.url}
   <div class="relative w-full h-auto">
      <iframe src={data.contract.url} frameborder="0" title='Lease' class="sm:w-11/12 sm:h-screen place-self-center"></iframe>
   </div>
   {/if}
</div>