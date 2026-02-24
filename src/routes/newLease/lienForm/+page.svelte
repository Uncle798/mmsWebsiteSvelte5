<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/core/Button.svelte';
	import PropertyWithLien from '$lib/displayComponents/PropertyWithLien.svelte';
	import PropertySubjectToLienForm from '$lib/forms/PropertySubjectToLienForm.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
</script>
<Header title='Property with lien form' />
<div class="mt-14 sm:mt-12 mb-8 mx-2">
   {#each data.properties as property}
      <PropertyWithLien {property} />
   {/each}
   <Button
      label='This is all the property that is subject to a lien'
      type='button'
      onClick={() => {
         goto(`/makePayment?leaseId=${data.lease.leaseId}&invoiceNum=${data.invoiceNum}&newLease=true`)
      }}
   />
   {#if data.lease}
      <div>Add property subject to lien</div>
      <PropertySubjectToLienForm data={data.lienForm} leaseId={data.lease.leaseId} redirectTo='/newLease/lienForm' invoiceNum={data.invoiceNum}/>
   {/if}
</div>