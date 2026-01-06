<script lang="ts">
	import Button from '$lib/core/Button.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
</script>
<div class="mt-14 sm:mt-12 mb-8 mx-2">
   <div class="flex flex-row gap-2">
      <div class="flex flex-col">
         {#if data.customer}
            <UserEmployee user={data.customer} />
            <form method="POST">
               <Button
                  type='submit'
                  label='Delete fake customer'
               />
            </form>
         {/if}
         {#if data.address}
            <AddressEmployee address={data.address} />
         {/if}
      </div>
      <div class="flex flex-row">
         {#if data.alternateContact}
            <UserEmployee user={data.alternateContact} />
         {/if}
         {#if data.alternateAddress}
            <AddressEmployee address={data.alternateAddress} />
         {/if}
      </div>
   </div>
   {#if data.lease}
      <LeaseEmployee lease={data.lease} />
   {/if}
   {#if data.contract.url}
      <div class="relative w-full min-h-155 my-2">
         <iframe src={data.contract.url} frameborder="0" title='Lease' class="sm:w-11/12 sm:h-screen place-self-center"></iframe>
      </div>
   {/if}
</div>