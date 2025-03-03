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
   let sizeFilter = $state('');
   const filterSize = $derived((units:Unit[]) => units.filter((unit) => unit.size.includes(sizeFilter)))
   function setSizeFilter(event:Event){
      const select = event.target as HTMLSelectElement;
      const size = select.value
      sizeFilter = size;
   }
</script>
<Header title='Available Units' />
{#await wrapper}
   <div class="mt-10">
      ...loading available units
   </div>
{:then availableUnits}   
   {#if data.user?.employee}
      <div class="flex sticky top-8 dark:bg-tertiary-950 bg-tertiary-50 rounded-b-lg" transition:fade={{duration:600}}>
         <span class="m-2">Available: {availableUnits.length} of {data.unitCount}</span>
         <span class="m-2">Available percentage {Math.round((availableUnits.length*100)/data.unitCount)}%</span>
         <span class="m-2">Open revenue per month: {currencyFormatter.format(lostRevenue)}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 m-1 sm:m-2 pt-10">
         <div class="col-span-full">
            <label for="sizeFilter" class="label-text">Filter by size
               <select name="sizeFilter" id="sizeFilter" class="select" bind:value={sizeFilter} onchange={setSizeFilter}>
                  <option value="">All</option>
                  {#each data.sizes as size}
                     <option value={size}>{size.replace(/^0/gm, '').replace(/x0/gm, 'x')}</option>
                  {/each}
               </select>
            </label>
         </div>
         {#each filterSize(availableUnits) as unit}
            <div class="border-2 border-primary-50 dark:border-primary-950 rounded-lg">
               <UnitEmployee {unit}/>
               <div class="text-center sm:col-span-2">
                  <a href="/employeeNewLease?unitNum={unit.num}" class="btn preset-filled-primary-50-950 rounded-lg m-2 text-wrap">Rent this unit</a>
               </div>
               <UnitNotesForm {unit} data={data.unitNotesForm} classes='mx-2' />
            </div>
         {/each}
      </div>
   {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 m-1 sm:m-2 pt-8" transition:fade={{duration:600}}>
         <span class="col-span-full h2 text-center">Available Units</span>
         <div class="col-span-full">
            <label for="sizeFilter" class="label-text">Filter by size
               <select name="sizeFilter" id="sizeFilter" class="select col-span-full">
                  <option value="">All</option>
                  {#each data.sizes as size}
                     <option value={size}>{size.replace(/^0/gm, '').replace(/x0/gm, 'x')}</option>
                  {/each}
               </select>
            </label>
         </div>
         {#each filterSize(availableUnits) as unit}
            <div class="border border-primary-50 dark:border-primary-950 rounded-lg">
               <UnitCustomer {unit}/>
               <div class="text-center sm:col-span-2">
                  <a href="/newLease?unitNum={unit.num}" class="btn preset-filled-primary-50-950 rounded-lg m-2 text-wrap">Rent this unit</a>
               </div>
            </div>
         {/each}
      </div>
   {/if}
{/await}
