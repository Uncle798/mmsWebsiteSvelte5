<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import Header from '$lib/Header.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
	import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import { fade, blur } from 'svelte/transition';
   import type { Invoice } from '@prisma/client';
   let { data }: { data: PageData } = $props();
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
   let unitPricingModalOpen = $state(false);
   let currentOldPrice = $state(0);
   function openModal(oldPrice: number){
      currentOldPrice = oldPrice;
      unitPricingModalOpen = true
   }
   let sizeMenuOpen = $state(false);
   const sizeRevenue = $derived((invoices:Invoice[])=>{
      let totalRevenue = 0;
      invoices.forEach((invoice)=>{
         if(!invoice.deposit){
            totalRevenue += invoice.invoiceAmount
         }
      })
      return totalRevenue
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
      <button class="btn" onclick={()=>unitPricingModalOpen = false}>Close</button>
   {/snippet}

</Modal>

{#if data.sizes}
   <button class='btn' onclick={()=>sizeMenuOpen = !sizeMenuOpen}>Select a size</button>
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

{#each data.units as unit, index } 
<div class="flex">
   {#if index === 0}
      <button class="btn " onclick={()=> openModal(unit.advertisedPrice)}>Change all {data.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} prices</button>
      Total revenue from {unit.size.replace(/^0+/gm,'').replace(/x0/gm,'x')} units: {currencyFormatter.format(sizeRevenue(data.invoices))}
   {/if}
</div>
   {@const leases = data.leases.filter((lease) => lease.unitNum = unit.num)}
   <div class="flex" transition:fade={{duration:600}}>
      <div class="flex">
         <UnitEmployee unit={unit}/>
         {#each leases as lease}
         {@const customer = data.customers.find((customer) => customer.id === lease.customerId)}
            <LeaseEmployee lease={lease} />
            {#if customer }
               <User user={customer} />
            {/if}
         {/each}
      </div>
   </div>
{/each} 