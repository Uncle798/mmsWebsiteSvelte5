<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import Header from '$lib/Header.svelte';
	import { Accordion, Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import { fade, blur } from 'svelte/transition';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import type  { Lease } from '@prisma/client';
	import Address from '$lib/displayComponents/Address.svelte';
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

{#if data.sizes}
   <button class='btn preset-filled-primary-50-950 rounded-lg' onclick={()=>sizeMenuOpen = !sizeMenuOpen}>Select a size</button>
   {#if sizeMenuOpen}
   <div transition:fade={{duration:600}}>
      <ul>
         {#each data.sizes as size}
         <li>
            <a href="/units/size/{size}" class="btn">{size.replace(/^0+/gm, '').replace(/x0/gm,'x')}</a>
         </li>
         {/each}
         <li><button class="btn" onclick={()=>sizeMenuOpen=false}>Close menu</button></li>
      </ul>
   </div>
   {/if}
{/if}

<button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>unitPricingModalOpen = true}>Change All {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} prices</button>
<Revenue amount={leasedAmount} label='Current Monthly revenue from {data.size.replace(/^0+/gm, '').replace(/x0/gm,'x')} units'/>
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
            <div class="grid grid-cols-3 gap-y-3 gap-x-1">
               {#each units as unit}
               {@const lease = leases.find((lease) => lease.unitNum === unit.num)}
               {@const customer = customers.find((customer)=> customer.id === lease?.customerId)}
                     <UnitEmployee {unit} classes="border border-primary-50 dark:border-primary-950 rounded-lg" />
                  {#if lease}
                     <LeaseEmployee {lease} classes="border border-primary-50 dark:border-primary-950 rounded-lg"/>
                  {:else}
                     <div></div>
                     {/if}
                     {#if customer}
                     {@const address = addresses.find((address) => address.userId === customer.id)}
                        <div class="border border-primary-50 dark:border-primary-950 rounded-lg p-2">
                           <User user={customer} classes="" />
                           {#if address}
                              <Address {address} />
                           {/if}
                        </div>
                     {:else}
                        <div></div>
                     {/if}
               {/each}
            </div>
         {/await}
      {/await}
   {/await}
{/await}