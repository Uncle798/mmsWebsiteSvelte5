<script lang="ts">
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
   import { fade } from 'svelte/transition';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
   import type { PageData } from './$types';
   import type { Unit } from '@prisma/client';
	import { SearchIcon, PanelTopClose, } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import Header from '$lib/Header.svelte';
	import ExplainerModal from '$lib/displayComponents/Modals/ExplainerModal.svelte';
   import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
   import Combobox from '$lib/formComponents/Combobox.svelte';

	import { page } from '$app/state';
   let { data }: { data: PageData } = $props();
   let sizeFilter = $state('');
   const filterSize = $derived((units:Unit[]) => units.filter((unit) => {
      if(sizeFilter === 'all'){
         return unit;
      } else if(unit.size.includes(sizeFilter)){
         return unit
      }
   }));
   let lostRevenue = $derived.by(() => {
      let revenue = 0;
      for(const unit of data.units){
         revenue += unit.advertisedPrice;
      }
      return revenue
   });
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   interface ComboboxData {
      label: string;
      value: string;
   }
   const comboboxData:ComboboxData[] = $derived(data.sizes.map(size => ({
      label: size.replace(/^0+/gm, '').replace(/x0/gm, 'x'),
      value: size      
   })))

	let searchDrawerOpen = $state(false);
   let descriptionModalOpen = $state(data.cookie ? false : true);
   onMount(()=>{
      if(data.cookie){
         descriptionModalOpen=false
      } else {
         fetch('/api/demoSetCookie?demoPage=unitsUnavailable');
         setTimeout(()=>(descriptionModalOpen = false), 5000)
      }
      comboboxData.unshift({label: 'All', value: 'all'})
   });
   const url = page.url.pathname
</script>
<div class="flex fixed bg-tertiary-50-950 w-full rounded-b-lg top-7 pt-2" transition:fade={{duration:600}}>
   <span class="m-2">Unavailable: {data.units.length} of {data.unitCount}</span>
   <span class="m-2">Unavailable percentage {Math.round((data.units.length*100)/data.unitCount)}%</span>
   <span class="m-2">Unavailable revenue per month: {currencyFormatter.format(lostRevenue)}</span>
</div>
<SearchDrawer
   modalOpen={searchDrawerOpen}
   height='h-[180]'
>
   {#snippet content()}
      <div class="mx-2 mt-11">
         <Combobox 
            data={comboboxData} 
            label='Select Size' 
            placeholder='Select size...'
            onValueChange={(details) => {
               searchDrawerOpen=false;
               sizeFilter=details.value[0];
            }}
         />
   </div>
   {/snippet}
</SearchDrawer>
<ExplainerModal
   modalOpen={descriptionModalOpen}
>
   {#snippet copy()}
      Need to clean a unit? Unit have a broken door? Mark it unavailable on its page or, <a href="/units" class="anchor">all units</a> and it will show up here. This is a todo list.
   {/snippet}
</ExplainerModal>
<Header title='Unavailable Units' />
<div class="grid grid-cols-1 gap-3 m-1 sm:m-2 sm:mt-20 mt-32 mb-8 sm:mb-8">
   {#each filterSize(data.units) as unit}
      <div class="border-2 border-primary-50-950 rounded-lg">
         <UnitEmployee {unit}/>
         <UnitNotesForm {unit} data={data.unitNotesForm} classes='mx-2' />
      </div>
   {/each}
</div>