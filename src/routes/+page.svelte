
<script lang="ts">
	import { PUBLIC_COMPANY_EMAIL, PUBLIC_COMPANY_NAME, PUBLIC_PHONE } from "$env/static/public";
   import PalouseHills from '$lib/Photos/Palouse_hills_northeast_of_Walla_Walla.jpg'
   import Header from "$lib/Header.svelte";
   import type { PageData } from "./$types";
   import type { Unit } from '@prisma/client'
	import UnitCustomer from "$lib/displayComponents/customerViews/UnitCustomer.svelte";
	import { size } from "@skeletonlabs/floating-ui-svelte";
	import { fade } from "svelte/transition";
	import Placeholder from "$lib/displayComponents/Placeholder.svelte";
   interface Props {
      data: PageData;
   }
   let { data }: Props = $props();
   let prices:number[]=[];
   const wrapper = new Promise<Unit[]>(async res => {
      const allAvailableUnits = await data.availableUnits;
      const shownUnits:Unit[] = []
      allAvailableUnits.forEach((unit) => {
         const alreadyAdded = shownUnits.find((u) => unit.size === u.size)
         if(!alreadyAdded){
            shownUnits.push(unit)
         } 
      })
      res(shownUnits);
   })
   let sizeFilter = $state('');
   let priceFilter = $state(0);
   const filterPrice = $derived((units:Unit[]) => units.filter((unit) => {
      if(priceFilter !== 0){
         unit.advertisedPrice === priceFilter
      } else{
         return unit
      }
   }))
   const filterSize = $derived((units:Unit[]) => units.filter((unit) => unit.size.includes(sizeFilter)))
   function setSizeFilter(event:Event){
      const select = event.target as HTMLSelectElement;
      const size = select.value
      sizeFilter = size;
      priceFilter = 0
   }
   const formattedPhone = PUBLIC_PHONE.substring(0,1) +'-'+ PUBLIC_PHONE.substring(1,4)+'-'+PUBLIC_PHONE.substring(4,7)+'-'+PUBLIC_PHONE.substring(7)
</script>

<Header title='Home' />
<!-- {#await wrapper}
   <article class="m-2 mt-10" transition:fade={{duration:600}}>
      <div>
         <p>
            {#if data.user}
               Welcome to the {PUBLIC_COMPANY_NAME} home page {data.user.givenName}!
            {:else}
               Welcome to the {PUBLIC_COMPANY_NAME} home page!
            {/if}
            Nestled in the hills of the Palouse just outside Moscow off the Troy Highway, {PUBLIC_COMPANY_NAME} is the place to safely and securely store your belongings.</p>
            <p>Family owned and operated since 1993 you can contact us at 
            <a href="tel:{PUBLIC_PHONE}" class="anchor">
               { formattedPhone }</a>, or <a href="mailto:{PUBLIC_COMPANY_EMAIL}" class="anchor">{PUBLIC_COMPANY_EMAIL}</a> the office and gates are open 8:00 am to 8:00 pm.
         </p>
      </div>
   </article>
{:then units} 
      <article class="m-2 mt-10">
         <div>
            <p>
               {#if data.user}
                  Welcome to the {PUBLIC_COMPANY_NAME} home page {data.user.givenName}!
               {:else}
                  Welcome to the {PUBLIC_COMPANY_NAME} home page!
               {/if}
               Nestled in the hills of the Palouse just outside Moscow off the Troy Highway, {PUBLIC_COMPANY_NAME} is the place to safely and securely store your belongings.</p>
               <p>Family owned and operated since 1993 you can contact us at 
               <a href="tel:{PUBLIC_PHONE}" class="anchor">
                  { formattedPhone }</a>, or <a href="mailto:{PUBLIC_COMPANY_EMAIL}" class="anchor">{PUBLIC_COMPANY_EMAIL}</a> the office and gates are open 8:00 am to 8:00 pm.
            </p>
         </div>
      </article>
   <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 m-2" transition:fade={{duration:600}}>
      <h1 class="h3 text-center lg:col-start-2 lg:col-end-4 sm:col-span-2 md:col-start-2 md:col-end-3 ">Available Units</h1>
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
      {#each filterPrice(filterSize(units)) as unit}
         <div class="flex flex-col border rounded-lg border-primary-50 dark:border-primary-950">
            <UnitCustomer {unit} classes=''/>
            <a class="btn preset-filled-primary-50-950 rounded-lg m-2 text-wrap" href="/newLease?unitNum={unit.num}">Rent this Unit</a>
         </div>
      {/each}
   </div>
{/await} -->
      <Placeholder numCols={3} numRows={1} heightClass='h-10' classes='mt-10 z-0'/>