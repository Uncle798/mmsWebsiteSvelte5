<script lang="ts">
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
   import { fade } from 'svelte/transition';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
   import type { Unit } from '@prisma/client';
	import { SearchIcon, PanelTopClose } from 'lucide-svelte';
   let { data }: { data: PageData } = $props();
   let sizeFilter = $state('');
   const filterSize = $derived((units:Unit[]) => units.filter((unit) => unit.size.includes(sizeFilter)))
   function setSizeFilter(event:Event){
      const select = event.target as HTMLSelectElement;
      const size = select.value
      sizeFilter = size;
   }
   let lostRevenue = $state(0);
   data.units.forEach((unit) => {
      if(unit.size !== 'ours'){
         lostRevenue += unit.advertisedPrice;
      }
   })
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   interface ComboboxData {
      label: string;
      value: string;
   }
   const comboboxData:ComboboxData[] = [{
      label: 'All',
      value: 'All'
   }];
   for(const size of data.sizes){
      comboboxData.push({
         label: size.replace(/^0+/gm, '').replace(/x0/gm, 'x'),
         value: size
      })
   }
	let searchDrawerOpen = $state(false);
	let selectedSize = $state(['']);
</script>
<div class="flex fixed bg-tertiary-50-950 w-full rounded-b-lg top-9" transition:fade={{duration:600}}>
   <span class="m-2">Unavailable: {data.units.length} of {data.unitCount}</span>
   <span class="m-2">Available percentage {Math.floor((data.units.length*100)/data.unitCount)}%</span>
   <span class="m-2">Unavailable revenue per month: {currencyFormatter.format(lostRevenue)}</span>
</div>
<Modal
   open={searchDrawerOpen}
   onOpenChange={(event)=>(searchDrawerOpen = event.open)}
   triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50'
   contentBase='bg-surface-100-900 h-[230px] w-screen rounded-b-lg'
   positionerJustify=''
   positionerAlign=''
   positionerPadding=''
   transitionsPositionerIn={{y:-230, duration: 600}}
   transitionsPositionerOut={{y:-230, duration: 600}}
   modal={false}
>
   {#snippet trigger()}
      <SearchIcon aria-label='Search' />
   {/snippet}
   {#snippet content()}
      <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose/></button>
      <div class="mx-2 mt-9">
         <Combobox data={comboboxData} 
            label='Select Size' 
            bind:value={selectedSize} 
            positionerBase='overflow-auto h-44 '
            labelBase=''
            placeholder='Select size...'
            onValueChange={(details) => {
               searchDrawerOpen=false;
               selectedSize=details.value
            }}
         />
   </div>
   {/snippet}
</Modal>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 m-1 sm:m-2 sm:mt-20 mt-32">
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