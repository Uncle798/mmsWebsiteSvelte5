<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import Header from '$lib/Header.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';

   let { data }: { data: PageData } = $props();
   let unitPricingModalOpen = $state(false);
   let currentOldPrice = $state();
   function openModal(oldPrice: number){
      currentOldPrice = oldPrice;
      unitPricingModalOpen = true
   }
</script>
<Header title='All {data.size.replace(/^0+/gm,'').replace(/0x/gm,'x')} units' />
<Modal
   bind:open={unitPricingModalOpen}
   triggerBase="btn preset-tonal"
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
   backdropClasses=""
>  
{#snippet content()}
   <UnitPricingForm data={data.unitPricingForm} bind:unitPricingFormModalOpen={unitPricingModalOpen} size={data.size} oldPrice={currentOldPrice}/>
   <button class="btn" onclick={()=>unitPricingModalOpen = false}>Close</button>
{/snippet}

</Modal>

{#each data.units as unit} 
   {@const {lease} = unit }
   <div class="flex">
      <div>
      <UnitEmployee unit={unit}/>
      <button class="btn " onclick={()=> openModal(unit.advertisedPrice)}>Change all {data.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} prices</button>
   </div>
      {#each lease as l}
      <LeaseEmployee lease={l} />
      {/each}
   </div>
{/each} 