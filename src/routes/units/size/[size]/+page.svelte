<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import type  { Lease, Unit } from '@prisma/client';
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import { goto, onNavigate } from '$app/navigation';
   import { browser } from '$app/environment';
	import { PanelTopClose, SearchIcon } from 'lucide-svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import SearchDrawer from '$lib/displayComponents/Modals/SearchDrawer.svelte';
	import ProgressLine from '$lib/displayComponents/ProgressLine.svelte';
   import ProgressRing from '$lib/displayComponents/ProgressRing.svelte';
   import Combobox from '$lib/formComponents/Combobox.svelte';
	import RevenueBar from '$lib/displayComponents/RevenueBar.svelte';

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
   const comboboxData:ComboboxData[] = $derived(data.sizes.map(size => ({
      label: size.replace(/^0+/gm, '').replace(/x0/gm, 'x'),
      value: size
   })))
   let searchDrawerOpen = $state(false);
   let delayed = $state(false);
   let timeout = $state(false);
   onNavigate(() => {
      delayed = false;
      timeout = false;
   })
</script>
<Header title='All {data.size.replace(/^0+/gm,'').replace(/0x/gm,'x')} units' />

<FormModal
   modalOpen={unitPricingModalOpen}
>  
   {#snippet content()}
      <UnitPricingForm data={data.unitPricingForm} bind:unitPricingFormModalOpen={unitPricingModalOpen} size={data.size} oldPrice={currentOldPrice}/>
   {/snippet}
</FormModal>


{#await data.units}
   <div class="relative m-1 sm:m-2 mt-14 sm:mt-10">
      Loading units...
   </div>
{:then units}
   {#await data.leases}
   <div class="relative m-1 sm:m-2 mt-4">
      Loading leases...
   </div>
   {:then leases} 
      <SearchDrawer 
         modalOpen={searchDrawerOpen}
         height='h-[180px]'
      >
         {#snippet content()}
            <div class="mx-2 mt-11 flex flex-row gap-2">
               <Combobox
                  data={comboboxData}
                  label='Select Size'
                  onValueChange={(event) =>{
                     setTimeout(() =>{
                        delayed = true;
                     }, 300);
                     if(browser && event.value[0] === 'all'){
                        if(browser){
                           goto('/units')
                        }
                     } else if(browser){
                        goto(`/units/size/${event.value[0]}`)
                     }
                  }}
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
               <button class="btn preset-filled-primary-50-950 rounded-lg mt-5" onclick={()=>openModal(units[0].advertisedPrice)}>Change All {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} prices</button>
            </div>
         {/snippet}
      </SearchDrawer>
      {#if units.length > 0 }
         <RevenueBar>
            {#snippet content()}               
               <Revenue amount={currentRevenue(units)} label='Current revenue from {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} units' />
               <span class="mx-1 sm:mx-2 w-1/3">Available: {availableUnits(units, leases).length} of {units.length} ({Math.round((availableUnits(units, leases).length*100)/units.length)}%)</span>
               <span class="mx-1 sm:mx-2 w-1/3">Open revenue: {currencyFormatter.format(lostRevenue(availableUnits(units, leases)))}</span>
            {/snippet}
         </RevenueBar>
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
            <div class="grid grid-cols-1 gap-3 m-1 sm:m-2 mt-32 sm:mt-22 mb-8">
               {#each units as unit}
               {@const lease = leases.find((lease) => lease.unitNum === unit.num)}
               {@const customer = customers.find((customer)=> customer.id === lease?.customerId)}
                  <div class="border-2 border-tertiary-50-950 rounded-lg sm:grid sm:grid-cols-3">
                     <UnitEmployee {unit} classes="border border-primary-50-950 rounded-md m-2" />
                     {#if lease}
                        <LeaseEmployee {lease} classes="border border-primary-50-950 rounded-md m-2"/>
                     {:else}
                        <div class="col-span-2 m-2"><span>Open Unit</span></div>
                     {/if}
                     {#if customer}
                     {@const address = addresses.find((address) => address.userId === customer.id)}
                        <div class="border border-primary-50-950 rounded-md m-2">
                           <UserEmployee user={customer} classes="mx-2 truncate" />
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