
<script lang="ts">
	import { PUBLIC_COMPANY_EMAIL, PUBLIC_COMPANY_NAME, PUBLIC_PHONE } from "$env/static/public";
   import Header from "$lib/Header.svelte";
   import type { PageData } from "./$types";
   import type { Unit } from '@prisma/client'
	import UnitCustomer from "$lib/displayComponents/customerViews/UnitCustomer.svelte";
	import { fade } from "svelte/transition";
	import Placeholder from "$lib/displayComponents/Placeholder.svelte";
	import { Portal, Tooltip } from "@skeletonlabs/skeleton-svelte";
   import { driver } from 'driver.js';
   import 'driver.js/dist/driver.css'
	import { onMount } from "svelte";
   import { mainMenuOpen } from '$lib/MainMenuOpen.svelte';

   interface Props {
      data: PageData;
   }
   let { data }: Props = $props();
   const id = $props.id();
   let sizeFilter = $state('');
   const filterSize = $derived((units:Unit[]) => units.filter((unit) => unit.size.includes(sizeFilter)))
   function setSizeFilter(event:Event){
      const select = event.target as HTMLSelectElement;
      const size = select.value
      sizeFilter = size;
   }
   const formattedPhone = PUBLIC_PHONE.substring(0,1) +'-'+ PUBLIC_PHONE.substring(1,4)+'-'+PUBLIC_PHONE.substring(4,7)+'-'+PUBLIC_PHONE.substring(7)
   let copyTooltipOpen = $state(false);

   onMount(() => {
      const mainPageTour = driver({
         showProgress: true,
         showButtons: ['close', 'next', 'previous'],
         steps: [
            { popover: { title: 'Welcome', description: `Welcome to your homepage ${data.user?.givenName}` } },
            { element: '.homeCopy', popover: { title: 'Here\'s where we tell your story', description: `Here's where we tell your story. All text on the site is customizable to your specifications` } },
            { element: '.firstUnit', popover: { title: `Available units`, description: `This is the smallest unit available for rent ` } },
            { element: '.mainMenuButton', popover: { title: `Main menu`, description: `This is the main menu` } },
            { element: '.mainMenu', popover: { title: `Main menu`, description: `Here you can find your customers, units, invoices, payment records, and refunds`}}
         ],
         onNextClick: (element, step, options) => {
            if(step.element === '.mainMenuButton'){
               mainMenuOpen.open = true;
               console.log(mainMenuOpen.open)
            }
            mainPageTour.moveNext()
         }
      });
      mainPageTour.drive();
   })
</script>
<Header title='Home' />

{#await data.availableUnits}
   <article class="m-2 mt-14 sm:mt-10">
      <div>
         <Tooltip open={copyTooltipOpen}>
            <Tooltip.Trigger>
                  Thank you for visiting {PUBLIC_COMPANY_NAME}!
                  Conveniently located, {PUBLIC_COMPANY_NAME} is the place to safely and securely store your belongings.
                  <p>Family owned and operated, you can contact us at 
                     <a href="tel:{PUBLIC_PHONE}" class="anchor">
                        { formattedPhone }</a>, or <a href="mailto:{PUBLIC_COMPANY_EMAIL}" class="anchor">{PUBLIC_COMPANY_EMAIL}</a> the office and gates are open 8:00 am to 8:00 pm.
                  </p>
            </Tooltip.Trigger>
            <Portal>
               <Tooltip.Positioner>
                  <Tooltip.Content class='card bg-surface-300-700 p-2'>
                     Tell your story here. We can customize copy to your exact specifications.
                  </Tooltip.Content>
               </Tooltip.Positioner>
            </Portal>
         </Tooltip>
      </div>
   </article>
   <div in:fade={{duration:600}} out:fade={{duration:0}}>
      <span class="mx-2">Loading available units...</span>
      <Placeholder numCols={1} numRows={4} heightClass='h-34' classes='z-0 sm:hidden'/>
      <Placeholder numCols={2} numRows={4} heightClass='h-34' classes='z-0 hidden sm:block md:hidden' />
      <Placeholder numCols={3} numRows={4} heightClass='h-34' classes='z-0 hidden md:block lg:hidden' />
      <Placeholder numCols={4} numRows={4} heightClass='h-34' classes='z-0 hidden lg:block' />     
   </div>
   {:then units}
   <article class="m-2 mt-14 sm:mt-10">
      <div>
            <Tooltip>
               <Tooltip.Trigger>
                  <div class="homeCopy">
                     Thank you for visiting {PUBLIC_COMPANY_NAME}!
                     Conveniently located, {PUBLIC_COMPANY_NAME} is the place to safely and securely store your belongings.
                     <p>Family owned and operated, you can contact us at 
                        <a href="tel:{PUBLIC_PHONE}" class="anchor">
                           { formattedPhone }</a>, or <a href="mailto:{PUBLIC_COMPANY_EMAIL}" class="anchor">{PUBLIC_COMPANY_EMAIL}</a> the office and gates are open 8:00 am to 8:00 pm.
                     </p>
                  </div>
               </Tooltip.Trigger>
               <Portal>
                  <Tooltip.Positioner>
                     <Tooltip.Content class='card bg-surface-300-700 p-2'>
                        Tell your story here. We can customize copy to your exact specifications.
                     </Tooltip.Content>
                  </Tooltip.Positioner>
               </Portal>
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
      {#each filterSize(units) as unit, i}
         <div class="flex flex-col border rounded-lg border-primary-50-950 justify-between" in:fade={{duration:600}}>
            {#if i === 0}
               <div class="firstUnit">
                  <UnitCustomer {unit}/>
                  {#if data.user?.employee}
                  <a class="btn preset-filled-primary-50-950 m-2 w-11/12 self-center" href="/employeeNewLease?unitNum={unit.num}">Rent this Unit</a>
                  {:else}
                  <a class="btn preset-filled-primary-50-950 m-2" href="/newLease?unitNum={unit.num}">Rent this Unit</a>
                  {/if}
               </div>   
            {:else}
               <UnitCustomer {unit}/>
               {#if data.user?.employee}
                  <a class="btn preset-filled-primary-50-950 m-2 w-11/12 self-center" href="/employeeNewLease?unitNum={unit.num}">Rent this Unit</a>
               {:else}
                  <a class="btn preset-filled-primary-50-950 m-2" href="/newLease?unitNum={unit.num}">Rent this Unit</a>
               {/if}
            {/if}
         </div>
      {/each}
   </div>
{/await}
