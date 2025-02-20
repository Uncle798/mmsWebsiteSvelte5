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
	import type  { Lease } from '@prisma/client';
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
   let { data }: { data: PageData } = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
   let unitPricingModalOpen = $state(false);
   let currentOldPrice = $state(0);
   function openModal(oldPrice: number){
      currentOldPrice = oldPrice;
      unitPricingModalOpen = true
   }
   let sizeMenuOpen = $state(false);
   let leasedAmount = $state(0)
   const wrapper = new Promise<Lease[]>(async res => {
      const leases = await data.leases
      res(leases)
      leases.forEach((lease) => {
         leasedAmount += lease.price
      })
   })
</script>
<Header title='All {data.size.replace(/^0+/gm,'').replace(/0x/gm,'x')} units' />
<Modal
   bind:open={unitPricingModalOpen}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
   backdropClasses=""
>  
   {#snippet content()}
      <UnitPricingForm data={data.unitPricingForm} bind:unitPricingFormModalOpen={unitPricingModalOpen} size={data.size} oldPrice={currentOldPrice}/>
      <button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>unitPricingModalOpen = false}>Close</button>
   {/snippet}

</Modal>
<div class="m-2 mt-4">
   {#if data.sizes}
      <button class='btn preset-filled-primary-50-950 rounded-lg' onclick={()=>sizeMenuOpen = !sizeMenuOpen}>Select a size</button>
      {#if sizeMenuOpen}
      <div transition:fade={{duration:600}}>
         <ul>
            {#each data.sizes as size}
               {#if size !== 'ours'}          
                  <li>
                     <a href="/units/size/{size}" class="anchor">{size.replace(/^0+/gm, '').replace(/x0/gm,'x')}</a>
                  </li>
               {/if}
            {/each}
            <li><button class="anchor" onclick={()=>sizeMenuOpen=false}>Close menu</button></li>
         </ul>
      </div>
      {/if}
   {/if}
</div>

<Revenue amount={leasedAmount} label='Current Monthly revenue from {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} units' classes='m-2'/>
{#await data.units}
   Loading units
{:then units}
   {#await data.leases}
      loading leases
   {:then leases} 
      {#await data.customers}
         loading customers
      {:then customers} 
         {#await data.addresses}
            loading addresses
         {:then addresses}
            <button class="btn preset-filled-primary-50-950 rounded-lg m-2" onclick={()=>openModal(units[0].advertisedPrice)}>Change All {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} prices</button>
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