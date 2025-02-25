<script lang="ts">
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
   import { fade } from 'svelte/transition';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
   import type { PageData } from './$types';
   import type { Unit } from '@prisma/client';

   let { data }: { data: PageData } = $props();
   let sizeFilter = $state('');
   const filterSize = $derived((units:Unit[]) => units.filter((unit) => unit.size.includes(sizeFilter)))
   function setSizeFilter(event:Event){
      const select = event.target as HTMLSelectElement;
      const size = select.value
      sizeFilter = size;
      console.log(sizeFilter)
   }
   let lostRevenue = $state(0);
   data.units.forEach((unit) => {
      if(unit.size !== 'ours'){
         lostRevenue += unit.advertisedPrice;
      }
   })
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'})
</script>
<div class="flex sticky top-8 dark:bg-tertiary-950 bg-tertiary-50 rounded-b-lg" transition:fade={{duration:600}}>
   <span class="m-2">Unavailable: {data.units.length} of {data.unitCount}</span>
   <span class="m-2">Available percentage {Math.round((data.units.length*100)/data.unitCount)}%</span>
   <span class="m-2">Unavailable revenue per month: {currencyFormatter.format(lostRevenue)}</span>
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
   {#each filterSize(data.units) as unit}
      <div class="border-2 border-primary-50 dark:border-primary-950 rounded-lg">
         <UnitEmployee {unit}/>
         <div class="text-center sm:col-span-2">
            <a href="/employeeNewLease?unitNum={unit.num}" class="anchor">Rent this unit</a>
         </div>
         <UnitNotesForm {unit} data={data.unitNotesForm} classes='mx-2' />
      </div>
   {/each}
</div>