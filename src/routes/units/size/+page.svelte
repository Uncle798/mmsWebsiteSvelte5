<script lang="ts">
   import Combobox from '$lib/formComponents/Combobox.svelte';
   import ProgressLine from '$lib/displayComponents/ProgressLine.svelte';
   import ProgressRing from '$lib/displayComponents/ProgressRing.svelte';
   import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
   import type { Unit } from '../../../generated/prisma/browser';
	import { humanUnitSize } from '$lib/utils/humanUnitSize';

   let { data }: { data: PageData } = $props();
   interface ComboboxData {
      label: string;
      value: string;
   }
   const comboboxData:ComboboxData[] = $derived(data.sizes.map(size => ({
      label: humanUnitSize(size),
      value: size
   })))
   onMount(() => {
      comboboxData.unshift({label: 'All', value: 'all'})
   })
   let delayed = $state(false);
   let timeout = $state(false);
   const allUnitsOfSize = $derived((size:string, units:Unit[]) => {
      return units.filter((unit) => unit.size === size);
   });
   const advertisedRent = $derived((units:Unit[]) => {
      let total = 0;
      for(const unit of units){
         total += unit.advertisedPrice;
      };
      return total;
   });
   const leasedRent = $derived((units:Unit[]) => {
      let total = 0;
      for(const unit of units){
         total += unit.leasedPrice ? unit.leasedPrice : 0;
      };
      return total;
   });
   const advertisedPricePerSqFt = $derived((unit:Unit) => {
      if(unit.size === 'Outside'){
         return unit.advertisedPrice / 10*15
      }
      const length = parseInt(unit.size.substring(0, unit.size.indexOf('x')), 10);
      const width = parseInt(unit.size.substring(unit.size.indexOf('x')+1), 10);
      console.log(length, width)
      if(!isNaN(length) && !isNaN(width)){
         return unit.advertisedPrice / length * width;
      } else {
         return -1;
      }
   });
</script>
<div class="mt-14 sm:mt-10 mx-2 mb-8 ">
   <div class="flex flex-row">
      <Combobox
         data={comboboxData}
         label='Select Size'
         onValueChange={(event) =>{
            setTimeout(() => {
               delayed = true
            }, 400)
            if(browser && event.value[0] === 'all'){
               goto('/units')
            } else if(browser){
               goto(`/units/size/${event.value[0]}`)
            }
         }}
         placeholder='Select or type'
      />
      {#if delayed}
         <ProgressRing  
            value={null} 
            {@attach () => {
               setTimeout(() => {
                  delayed = false;
                  timeout = true;
               }, 800)
            }}
         />
      {/if}
      {#if timeout}
         <ProgressLine value={null} />
      {/if}
   </div>
   <div class="gap-2">
      {#if data.units}
         {#each data.sizes as size}
         {@const humanSize = size.replace(/^0/gm, '').replace(/x0/gm, 'x') }
         <div class="flex">
               <Revenue label='Advertised price for a {humanSize}' amount={allUnitsOfSize(size, data.units)[0].advertisedPrice} />
               <Revenue label='Advertised total rent of {humanSize}' amount={advertisedRent(allUnitsOfSize(size, data.units))} />
               <Revenue label='Leased rent of {humanSize}' amount={leasedRent(allUnitsOfSize(size, data.units))} />
               <Revenue label='Advertised price/sqFt for {humanSize}' amount={advertisedPricePerSqFt(allUnitsOfSize(size, data.units)[0])} />
            </div>
         {/each}
      {/if}
   </div>
</div>