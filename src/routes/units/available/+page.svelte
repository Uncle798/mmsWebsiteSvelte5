<script lang="ts">
   import Header from '$lib/Header.svelte';
   import { fade } from 'svelte/transition';
   import type { PageData } from './$types';
   import type { Unit } from '@prisma/client';
	import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import UnitCustomer from '$lib/displayComponents/customerViews/UnitCustomer.svelte';
   import Combobox from '$lib/formComponents/Combobox.svelte';
	import { SearchIcon, PanelTopClose } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
   let { data }:{data:PageData} = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency:'USD'});
   let sizeFilter = $state('');
   const filterSize = $derived((units:Unit[]) => units.filter((unit) => unit.size.includes(sizeFilter)))
   interface ComboboxData {
      label: string,
      value: string,
   }
   const comboboxData:ComboboxData[] = [{
      label: 'All',
      value: 'All'
   }];
   onMount(async () => {
      let units = await data.availableUnits;
      const sizes:string[] = [];
      for(const unit of units){
         if(sizes.find((size) => size === unit.size)){
            continue;
         } else {
            sizes.push(unit.size)
         }
      }
      for(const size of sizes.sort((a, b) => {
         if(a > b){
            return 1;
         } else if (a === b ){
            return 0;
         } else {
            return -1;
         }
      })){
         comboboxData.push({
            value: size,
            label: size.replace(/^0+/gm,'').replace(/x0/gm,'x')
         })
      }
   })
   let selectedSize = $state([''])
   const lostRevenue = $derived((units:Unit[]) => {
      let revenue = 0;
      for(const unit of units){
         revenue += unit.advertisedPrice
      }
      return revenue;
   })
   let searchDrawerOpen = $state(false);
   let filteredUnits = $derived((units:Unit[]) => {
      if(selectedSize[0] === 'All'){
         return units;
      } else if(selectedSize[0] !== ''){
         return units.filter((unit) => {
            return unit.size === selectedSize[0]
         });
      } else {
         return units;
      }
   })
   const url = page.url.pathname;
</script>
<Header title='Available Units' />
{#await data.availableUnits}
   <div class="m-2 mt-14 sm:mt-10">
      ...loading available units
   </div>
{:then availableUnits}   
   <SearchDrawer
      modalOpen={searchDrawerOpen}
      height='h-[180]'
   >
      {#snippet content()}         
         <div class="m-1 sm:m-2 mt-11 sm:mt-11">
            <Combobox
               data={comboboxData}
               label='Filter by Size' 
               placeholder='Select size...'
               onValueChange={(details) => {
                  searchDrawerOpen = false
                  selectedSize=details.value
               }}
            />
         </div>
      {/snippet}
   </SearchDrawer>
   {#if data.user?.employee}
      <div class="flex fixed bg-tertiary-50-950 rounded-b-lg z-40 w-full top-11 sm:top-8">
         <span class="m-1">Available: {availableUnits.length} of {data.unitCount}</span>
         <span class="m-1">Percentage: {Math.round((availableUnits.length*100)/data.unitCount)}%</span>
         <span class="m-1">Open revenue per month: {currencyFormatter.format(lostRevenue(availableUnits))}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 m-1 sm:m-2 bg-surface-50-950 mt-28 sm:mt-18">
         {#each filteredUnits(availableUnits) as unit}
            <div class="border-2 border-primary-50-950 rounded-lg">
               <UnitEmployee {unit}/>
               <div class="text-center sm:col-span-2">
                  <a href="/employeeNewLease?unitNum={unit.num}&userId={data.userId}" class="btn preset-filled-primary-50-950 rounded-lg m-2 text-wrap">Rent this unit</a>
               </div>
               <UnitNotesForm {unit} data={data.unitNotesForm} classes='mx-2' />
            </div>
         {/each}
      </div>
   {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 m-1 sm:m-2 pt-8" in:fade={{duration:600}} out:fade={{duration:0}}>
         <span class="col-span-full h2 text-center">Available Units</span>
         {#each filterSize(availableUnits) as unit}
            <div class="border border-primary-50-950 rounded-lg">
               <UnitCustomer {unit}/>
               <div class="text-center sm:col-span-2">
                  <a href="/newLease?unitNum={unit.num}" class="btn preset-filled-primary-50-950 rounded-lg m-2 text-wrap">Rent this unit</a>
               </div>
            </div>
         {/each}
      </div>
   {/if}
{/await}
