
<script lang="ts">
	import { PUBLIC_COMPANY_EMAIL, PUBLIC_COMPANY_NAME, PUBLIC_PHONE } from "$env/static/public";
   import PalouseHills from '$lib/Photos/Palouse_hills_northeast_of_Walla_Walla.jpg'
   import Header from "$lib/Header.svelte";
   import type { PageData } from "./$types";
   import type { Unit } from '@prisma/client'
	import UnitCustomer from "$lib/displayComponents/customerViews/UnitCustomer.svelte";
	import { fade } from "svelte/transition";
	import Placeholder from "$lib/displayComponents/Placeholder.svelte";
	import { Tooltip } from "@skeletonlabs/skeleton-svelte";
   interface Props {
      data: PageData;
   }
   let { data }: Props = $props();

   let sizeFilter = $state('');
   const filterSize = $derived((units:Unit[]) => units.filter((unit) => unit.size.includes(sizeFilter)))
   function setSizeFilter(event:Event){
      const select = event.target as HTMLSelectElement;
      const size = select.value
      sizeFilter = size;
   }
   const formattedPhone = PUBLIC_PHONE.substring(0,1) +'-'+ PUBLIC_PHONE.substring(1,4)+'-'+PUBLIC_PHONE.substring(4,7)+'-'+PUBLIC_PHONE.substring(7)
   let copyTooltipOpen = $state(false);
</script>

<Header title='Home' />
{#await data.availableUnits}
   <article class="m-2 mt-12 sm:mt10">
      <div>
         <Tooltip
            open={copyTooltipOpen}
            onOpenChange={(e) => copyTooltipOpen = e.open}
            positioning={{placement: 'top'}}
            openDelay={200}
         >
            {#snippet trigger()}
               
               Thank you for visiting {PUBLIC_COMPANY_NAME}!
               Conveniently located, {PUBLIC_COMPANY_NAME} is the place to safely and securely store your belongings.
               <p>Family owned and operated, you can contact us at 
                  <a href="tel:{PUBLIC_PHONE}" class="anchor">
                     { formattedPhone }</a>, or <a href="mailto:{PUBLIC_COMPANY_EMAIL}" class="anchor">{PUBLIC_COMPANY_EMAIL}</a> the office and gates are open 8:00 am to 8:00 pm.
               </p>
            {/snippet}
            {#snippet content()}
               Tell your story here. We can customize copy to your exact specifications
            {/snippet}
         </Tooltip>
      </div>
   </article>
   <div in:fade={{duration:600}} out:fade={{duration:0}}>
      <span>Loading available units...</span>
      <Placeholder numCols={1} numRows={4} heightClass='h-34' classes='z-0 sm:hidden'/>
      <Placeholder numCols={2} numRows={4} heightClass='h-34' classes='z-0 hidden sm:block md:hidden' />
      <Placeholder numCols={3} numRows={4} heightClass='h-34' classes='z-0 hidden md:block lg:hidden' />
      <Placeholder numCols={4} numRows={4} heightClass='h-34' classes='z-0 hidden lg:block' />     
   </div>
{:then units} 
      <article class="m-2 mt-12 sm:mt10">
         <div>
            <Tooltip
            open={copyTooltipOpen}
            onOpenChange={(e) => copyTooltipOpen = e.open}
            positioning={{placement: 'top'}}
            contentBase="card preset-filled p-2"
            openDelay={200}
            zIndex='40'
         >
            {#snippet trigger()}
               <p>
                  Thank you for visiting {PUBLIC_COMPANY_NAME}!
                  Conveniently located, {PUBLIC_COMPANY_NAME} is the place to safely and securely store your belongings.
               </p>
               <p>
                  Family owned and operated, you can contact us at 
                  <a href="tel:{PUBLIC_PHONE}" class="anchor">
                     { formattedPhone }</a>, or <a href="mailto:{PUBLIC_COMPANY_EMAIL}" class="anchor">{PUBLIC_COMPANY_EMAIL}</a>. The office and gates are open 8:00 am to 8:00 pm.
               </p>
            {/snippet}
            {#snippet content()}
               Tell your story here. We can customize copy to your exact specifications
            {/snippet}
         </Tooltip>
         </div>
      </article>
   <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 mx-2 mb-24 sm:mb-14 lg:mb-9" in:fade={{duration:600}}>
      <h3 class="h3 text-center lg:col-start-2 lg:col-end-4 sm:col-span-2 md:col-start-2 md:col-end-3 ">Available Units</h3>
      <div class="col-span-1 sm:col-span-2 md:col-start-3 md:col-span-1 lg:col-start-4">
         <label for="size" class="label-text">Filter by size: 
            <select class="select rounded-lg" name='size' id='size' bind:value={sizeFilter} onchange={setSizeFilter}>
               <option value="">All</option>
               {#each data.sizes as size}
                  <option value={size}>{size.replace(/^0+/gm,'').replace(/x0/gm,'x')}</option>
               {/each}
            </select>
         </label>
      </div>
      {#each filterSize(units) as unit}
         <div class="flex flex-col border rounded-lg border-primary-50-950 justify-between" in:fade={{duration:600}}>
            <UnitCustomer {unit}/>
            <a class="btn preset-filled-primary-50-950 m-2" href="/newLease?unitNum={unit.num}">Rent this Unit</a>
         </div>
      {/each}
   </div>
{/await}
