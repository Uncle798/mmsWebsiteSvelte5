<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import Header from '$lib/Header.svelte';
	import { Accordion, Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import { fade, blur } from 'svelte/transition';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import type  { Lease, Unit } from '@prisma/client';
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import { beforeNavigate, invalidate, invalidateAll } from '$app/navigation';
	import { CrossIcon, X, XCircle, XCircleIcon } from 'lucide-svelte';
   let { data }: { data: PageData } = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
   let unitPricingModalOpen = $state(false);
   let currentOldPrice = $state(0);
   function openModal(oldPrice: number){
      currentOldPrice = oldPrice;
      unitPricingModalOpen = true
   }
   let sizeMenuOpen = $state(false);
   let leasedAmount = $state(0);
   const availableUnits:Unit[]=$state([]);
   let lostRevenue = $state(0);
   let numUnits = $state(0)
   const unitsWrapper = new Promise<Unit[]>(async res => {
      const units = await data.units;
      const leases = await data.leases;
      units.forEach((unit) => {
         const lease = leases.find((lease) => lease.unitNum === unit.num)
         if(!lease){
            availableUnits.push(unit)
         }
      });
      leases.forEach((lease) =>{
         leasedAmount += lease.price
      })
      numUnits = units.length
      availableUnits.forEach((unit) => {
         lostRevenue += unit.advertisedPrice
      })
      res(units)
   })
   beforeNavigate(()=> {
      sizeMenuOpen=false
      invalidateAll();
   })
</script>
<Header title='All {data.size.replace(/^0+/gm,'').replace(/0x/gm,'x')} units' />

<Modal
   bind:open={unitPricingModalOpen}
   contentBase="card bg-surface-400-600 p-4 shadow-xl m-1 w-fit"
   backdropClasses=""
>  
   {#snippet content()}
      <UnitPricingForm data={data.unitPricingForm} bind:unitPricingFormModalOpen={unitPricingModalOpen} size={data.size} oldPrice={currentOldPrice}/>
      <button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>unitPricingModalOpen = false}>Close</button>
   {/snippet}

</Modal>
<Modal
   bind:open={sizeMenuOpen}
   triggerBase="btn preset-filled-primary-50-950 hover:shadow-xl hover:border-2 border-secondary-50 dark:border-secondary-950 fixed top-10 z-50 mx-1 sm:mx-2 text-wrap w-14 sm:w-fit h-fit rounded-md sm:round-lg"
	contentBase="bg-surface-100-900 p-2 space-y-2 shadow-xl w-[120px] h-fit relative"
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding="pt-10"
	transitionsPositionerIn={{ x: -120, duration: 400 }}
	transitionsPositionerOut={{ x: -120, duration: 400 }}
>
   {#snippet trigger()}
      Select Size
   {/snippet}
   {#snippet content()}
      <ul>
         {#each data.sizes as size}
            {#if size !== 'ours'}          
               <li>
                  <a href="/units/size/{size}" class="anchor">{size.replace(/^0+/gm, '').replace(/x0/gm,'x')}</a>
               </li>
            {/if}
         {/each}
      </ul>
      <div class="absolute top-0 right-1"><button onclick={()=>sizeMenuOpen=false}><XCircleIcon size='14'/></button></div>
   {/snippet}
</Modal>
{#await unitsWrapper}
<div class="relative m-1 sm:m-2 mt-4">
   Loading units
</div>
{:then units}
   {#if units.length > 0 }
      <div class="flex sticky top-9 dark:bg-tertiary-950 bg-tertiary-50 rounded-b-lg w-full h-24 sm:h-16">
         <Revenue amount={leasedAmount} label='Current revenue from {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} units' classes='ml-16 sm:ml-32 sm:w-auto flex flex-col md:flex-row w-1/3'/>
         <div class="flex flex-col sm:flex-row">
            <span class="mx-1 sm:mx-2 ">Available: {availableUnits.length} of {numUnits} ({Math.round((availableUnits.length*100)/numUnits)}%)</span>
            <span class="mx-1 sm:mx-2 ">Open revenue: {currencyFormatter.format(lostRevenue)}</span>
         </div>
      </div>
      <button class="btn preset-filled-primary-50-950 rounded-lg  mx-1 sm:mx-2 mt-10" onclick={()=>openModal(units[0].advertisedPrice)}>Change All {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} prices</button>
   {:else}
      <div class="relative top-16 mx-2">
         Unit size not found
      </div>
   {/if}
   {#await data.leases}
      <div class="relative m-1 sm:m-2 mt-4">
         Loading leases
      </div>
   {:then leases} 
   {#await data.customers}
      <div class="relative m-1 sm:m-2 mt-4">
         Loading customers
      </div>
   {:then customers} 
      {#await data.addresses}
         <div class="relative m-1 sm:m-2 mt-4">
            Loading addresses
         </div>
         {:then addresses}
            <div class="grid grid-cols-1 gap-3 m-1 sm:m-2">
               {#each units as unit}
               {@const lease = leases.find((lease) => lease.unitNum === unit.num)}
               {@const customer = customers.find((customer)=> customer.id === lease?.customerId)}
                  <div class="border-2 border-primary-50 dark:border-primary-950 rounded-lg sm:grid sm:grid-cols-3">
                     <UnitEmployee {unit} classes="" />
                     {#if lease}
                        <LeaseEmployee {lease} classes=""/>
                     {:else}
                        <div></div>
                     {/if}
                     {#if customer}
                     {@const address = addresses.find((address) => address.userId === customer.id)}
                        <div class="p-2">
                           <UserEmployee user={customer} classes="" />
                           {#if address}
                              <Address {address} />
                           {/if}
                        </div>
                     {:else}
                        <div></div>
                     {/if}
                  </div>
               {/each}
            </div>
         {/await}
      {/await}
   {/await}
{/await}