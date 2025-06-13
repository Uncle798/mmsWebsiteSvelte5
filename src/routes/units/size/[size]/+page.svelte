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
   const availableUnits = $derived((units:Unit[], leases:Lease[]) =>{
      const availableUnits:Unit[] =[];
      for(const unit of units){
         const lease = leases.find((lease) => lease.unitNum === unit.num)
         if(!lease){
            availableUnits.push(unit)
         }
      }
      return availableUnits;
   });
   const currentRevenue = $derived((units:Unit[]) =>{
      let revenue = 0;
      for(const unit of units){
         if(unit.leasedPrice){
            revenue += unit.leasedPrice
         }
      }
      return revenue;
   });
   const lostRevenue = $derived((units:Unit[]) => {
      let revenue = 0;
      for(const unit of units){
         revenue += unit.advertisedPrice
      }
      return revenue;
   })
   interface ComboboxData {
      label: string;
      value: string;
   }
   const comboboxData:ComboboxData[] = [{label:'All', value:'all'}];
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
         if(event.value[0] === 'all'){
            if(browser){
               goto('/units')
            }
         }
         if(browser){
            goto(`/units/size/${event.value[0]}`)
         }
      }}
      classes='m-2'
   />
   <button class="btn preset-filled-primary-50-950 rounded-lg mt-5" onclick={()=>openModal(currentOldPrice)}>Change All {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} prices</button>
</div>

{#await data.units}
<div class="relative m-1 sm:m-2 mt-10">
   Loading units
</div>
{:then units}
{#await data.leases}
<div class="relative m-1 sm:m-2 mt-4">
   Loading leases
</div>
{:then leases} 
{#if units.length > 0 }
   <div class="flex fixed top-9 bg-tertiary-50-950 rounded-b-lg w-screen justify-between">
      <Revenue amount={currentRevenue(units)} label='Current revenue from {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} units' classes='w-1/3'/>
         <span class="mx-1 sm:mx-2 w-1/3">Available: {availableUnits(units, leases).length} of {units.length} ({Math.round((availableUnits(units, leases).length*100)/units.length)}%)</span>
         <span class="mx-1 sm:mx-2 w-1/3">Open revenue: {currencyFormatter.format(lostRevenue(availableUnits(units, leases)))}</span>
   </div>
{:else}
   <div class="top-16 mx-2">
      Unit size not found
   </div>
{/if}
   {#await data.customers}
      <div class="m-1 sm:m-2 mt-4">
         Loading customers
      </div>
   {:then customers} 
      {#await data.addresses}
         <div class="m-1 sm:m-2 mt-4">
            Loading addresses
         </div>
         {:then addresses}
            <div class="grid grid-cols-1 gap-3 m-1 sm:m-2 sm:mt-36">
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