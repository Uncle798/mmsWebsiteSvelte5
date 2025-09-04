<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import Header from '$lib/Header.svelte';
   import { fade } from 'svelte/transition';
   import type { PageData } from './$types';
   import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
   import UnitPricingForm from '$lib/forms/UnitPricingForm.svelte';
   import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
   import { Modal } from '@skeletonlabs/skeleton-svelte';
   import Revenue from '$lib/displayComponents/Revenue.svelte';
   import Address from '$lib/displayComponents/AddressEmployee.svelte';

   let modalOpen = $state(false);
   let currentLeaseId = $state('')
   let { data }: { data: PageData } = $props();
   const formattedCurrency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
</script>

{#await data.unit}
   <Header title='loading...' />
   ...loading unit
{:then unit}
   <Modal
      open={modalOpen}
      onOpenChange={(e) => modalOpen = e.open}
      contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
      backdropClasses="backdrop-blur-xs"
   >
   {#snippet content()}
      <LeaseEndForm data={data.leaseEndForm} leaseId={currentLeaseId} />
      <button type="button" class="btn preset-filled-primary-50-950" onclick={()=> modalOpen = false}>Close</button>
   {/snippet}
</Modal>
   {#if unit}
      <Header title='Unit number: {unit.num}' />
      <Revenue label='Total revenue from this unit' amount={data.totalRevenue} classes="flex sticky top-9 bg-tertiary-50-950 rounded-b-lg w-full p-2"/>
      <div transition:fade={{duration:600}} class="m-1 sm:m-2 pt-8 mb-20 sm:mb-12 lg:mb-8">
         <UnitEmployee {unit} classes=''/>
         <a href="/employeeNewLease?unitNum={unit.num}" class="btn preset-filled-primary-50-950 m-2 rounded-lg">Rent Unit {unit.num.replace(/^0+/gm, '')}</a>
         <UnitNotesForm data={data.unitNotesForm} {unit} classes=''/>
         <UnitPricingForm data={data.unitPricingForm} size={unit.size} oldPrice={unit.advertisedPrice} unitPricingFormModalOpen={modalOpen} />
         <div class="grid grid-cols-1 gap-y-2 gap-x-1">
            {#each data.leases as lease}
            {@const customer = data.customers.find((customer) => customer.id === lease.customerId)}
               {#if !lease.leaseEnded}
                  <div class="rounded-lg border-2 border-primary-50-950">
                     <div class="flex flex-col ">
                        <LeaseEmployee {lease}/>
                        <button class="btn rounded-lg preset-filled-primary-50-950 mx-2" onclick={()=>{modalOpen=true; currentLeaseId=lease.leaseId}}>End lease</button>
                     </div>                 
                     {#if customer}  
                     {@const address = data.addresses.find((address) => address.userId === customer.id)}
                     <div class="flex flex-col p-2">
                        <UserEmployee user={customer}/>
                        {#if address}
                        <Address {address} />
                        {/if}
                     </div>
                     {/if}
                  </div>
               {:else}
                  <div class="rounded-lg border-2 border-primary-50-950">
                     <LeaseEmployee {lease} classes=''/>
                     {#if customer}
                     {@const address = data.addresses.find((address) => address.userId === customer.id)}
                        <div class="flex flex-col sm:p-2 px-2 ">
                           <UserEmployee user={customer}/>
                           {#if address}
                                 <Address {address} />
                           {/if}
                        </div>
                     {/if}
                  </div>
               {/if}
            {/each}
         </div>
      </div>
   {/if}
{/await}