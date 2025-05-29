<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import Header from '$lib/Header.svelte';
	import { Modal, Combobox } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import { fade, blur } from 'svelte/transition';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import type  { Lease, Unit } from '@prisma/client';
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import { goto } from '$app/navigation';
   import { browser } from '$app/environment';
   let { data }: { data: PageData } = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
   let unitPricingModalOpen = $state(false);
   let currentOldPrice = $state(0);
   function openModal(oldPrice: number){
      currentOldPrice = oldPrice;
      unitPricingModalOpen = true
   }
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
      currentOldPrice = units[0].advertisedPrice
      res(units)
   })
   interface ComboboxData {
      label: string;
      value: string;
   }
   const comboboxData:ComboboxData[] = [];
   for(const size of data.sizes){
      comboboxData.push({
         label: size.replace(/^0+/gm, '').replace(/x0/gm, 'x'),
         value: size
      })
   }
   let selectedSize = $state(['']);
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
<div class="mx-2 fixed top-14 left-0 bg-surface-50-950 w-full flex border-b-2 border-primary-50-950 gap-2 items-center">
   <Combobox
      data={comboboxData}
      label='Select Size'
      value={selectedSize}
      onValueChange={(event) =>{
         if(browser){
            goto(`/units/size/${event.value[0]}`)
         }
      }}
      classes='m-2'
   />
   <button class="btn preset-filled-primary-50-950 rounded-lg mt-5" onclick={()=>openModal(currentOldPrice)}>Change All {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} prices</button>
</div>

{#await unitsWrapper}
<div class="relative m-1 sm:m-2 mt-4">
   Loading units
</div>
{:then units}
   {#if units.length > 0 }
      <div class="flex fixed top-8 bg-tertiary-50-950 rounded-b-lg w-full">
         <Revenue amount={leasedAmount} label='Current revenue from {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} units' classes='ml-16 sm:ml-32 sm:w-auto flex flex-col md:flex-row w-1/3'/>
         <div class="flex flex-col sm:flex-row">
            <span class="mx-1 sm:mx-2 ">Available: {availableUnits.length} of {numUnits} ({Math.round((availableUnits.length*100)/numUnits)}%)</span>
            <span class="mx-1 sm:mx-2 ">Open revenue: {currencyFormatter.format(lostRevenue)}</span>
         </div>
      </div>
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
            <div class="grid grid-cols-1 gap-3 m-1 sm:m-2 sm:mt-30">
               {#each units as unit}
               {@const lease = leases.find((lease) => lease.unitNum === unit.num)}
               {@const customer = customers.find((customer)=> customer.id === lease?.customerId)}
                  <div class="border-2 border-tertiary-50-950 rounded-lg sm:grid sm:grid-cols-3">
                     <UnitEmployee {unit} classes="border-1 border-primary-50-950 rounded-md m-2" />
                     {#if lease}
                        <LeaseEmployee {lease} classes="border-1 border-primary-50-950 rounded-md m-2"/>
                     {:else}
                        <div class="col-span-2"><span>Open Unit</span></div>
                     {/if}
                     {#if customer}
                     {@const address = addresses.find((address) => address.userId === customer.id)}
                        <div class="border-1 border-primary-50-950 rounded-md m-2">
                           <UserEmployee user={customer} classes="mx-2" />
                           {#if address}
                              <Address {address} classes='mx-2'/>
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