<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import PropertyWithLien from '$lib/displayComponents/PropertyWithLien.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
</script>

<div class="mt-12 mx-2">
   {#if data.property}
      <PropertyWithLien property={data.property} />
   {/if}
   {#if data.contact}
      <UserEmployee user={data.contact} />
   {/if}
   {#if data.address}
      <AddressEmployee address={data.address} />
   {/if}
   {#if data.lease}
      <LeaseEmployee lease={data.lease} />
   {/if}
</div>