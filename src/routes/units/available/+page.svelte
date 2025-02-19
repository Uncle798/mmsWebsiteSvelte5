<script lang="ts">
   import Header from '$lib/Header.svelte';
   import { fade } from 'svelte/transition';
   import type { PageData } from './$types';
   import HorizontalDivider from '$lib/displayComponents/HorizontalDivider.svelte';
   import type { Unit } from '@prisma/client';
	import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import UnitCustomer from '$lib/displayComponents/customerViews/UnitCustomer.svelte';
   let { data }:{data:PageData} = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency:'USD'});
   let lostRevenue = $state(0);
   const wrapper = new Promise<Unit[]>(async res => {
      const units = await data.units
      const leases = await data.leases
      const availableUnits:Unit[] = [];
      units.forEach((unit) => {
         const lease = leases.find((lease) => lease.unitNum === unit.num)
         if(!lease && !availableUnits.find((u) => u.size === unit.size)){
            availableUnits.push(unit);
         }
      })
      availableUnits.forEach((unit) => {
         lostRevenue += unit.advertisedPrice
      })
      res(availableUnits)
   })
</script>
<Header title='Available Units' />
{#await wrapper}
    ...loading available units
{:then availableUnits}   
   {#if data.user?.employee}
      <div class="flex m-2">
         <span class="m-2">Available: {availableUnits.length} of {data.unitCount}</span>
         <span class="m-2">Available percentage {Math.round((availableUnits.length*100)/data.unitCount)}%</span>
         <span class="m-2">Open revenue per month: {currencyFormatter.format(lostRevenue)}</span>
      </div>
      <HorizontalDivider />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 m-1 sm:m-2">
         {#each availableUnits as unit}
            <div class="border border-primary-50 dark:border-primary-950 rounded-lg">
               <UnitEmployee {unit}/>
               <UnitNotesForm {unit} data={data.unitNotesForm} />
            </div>
         {/each}
      </div>
      {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 m-1 sm:m-2">
         {#each availableUnits as unit}
            <div class="border border-primary-50 dark:border-primary-950 rounded-lg">
               <UnitCustomer {unit}/>
            </div>
         {/each}
      </div>

      {/if}
{/await}
