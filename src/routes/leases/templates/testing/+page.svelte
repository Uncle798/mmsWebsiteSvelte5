<script lang="ts">
	import Button from '$lib/core/Button.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
</script>
<div class="mt-14 sm:mt-12 mb-10 mx-2">
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
   {#if data.contract?.url}
      <iframe src={data.contract.url} frameborder="0" title='Lease' class="w-250 h-230 self-center"></iframe>
   {/if}
</div>