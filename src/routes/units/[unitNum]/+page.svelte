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
   import Revenue from '$lib/displayComponents/Revenue.svelte';
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
   import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';

   let modalOpen = $state(false);
   let currentLeaseId = $state('')
   let { data }: { data: PageData } = $props();
</script>

{#await data.unit}
   <Header title='loading...' />
   ...loading unit
{:then unit}
   <FormModal
      modalOpen={modalOpen}
   >
      {#snippet content()}
         <LeaseEndForm data={data.leaseEndForm} leaseId={currentLeaseId} />
      {/snippet}
   </FormModal>
   {#if unit}
      <Header title='Unit number: {unit.num}' />
      <Revenue label='Total revenue from this unit' amount={data.totalRevenue} classes="flex sticky top-8 bg-tertiary-50-950 rounded-b-lg w-full p-2"/>
      <div transition:fade={{duration:600}} class="m-1 sm:m-2 mt-12 sm:mt-12 mb-8 sm:mb-8">
         <div class="border-2 border-primary-50-950 rounded-lg">
            <UnitEmployee {unit} classes='mx-2'/>
            <a href="/employeeNewLease?unitNum={unit.num}" class="btn preset-filled-primary-50-950 m-2 rounded-lg">Rent Unit {unit.num.replace(/^0+/gm, '')}</a>
         </div>
         <UnitNotesForm data={data.unitNotesForm} {unit} classes=''/>
         <UnitPricingForm data={data.unitPricingForm} size={unit.size} oldPrice={unit.advertisedPrice} unitPricingFormModalOpen={modalOpen} />
         <div class="grid grid-cols-1 gap-y-2 sm:grid-cols-2 gap-x-1">
            {#each data.leases as lease}
            {@const customer = data.customers.find((customer) => customer.id === lease.customerId)}
               <div class="rounded-lg border-2 border-primary-50-950 ">
                  <div class="flex flex-col sm:flex-row">
                     <LeaseEmployee {lease}/>
                     {#if !lease.leaseEnded}
                        <button class="btn rounded-lg preset-filled-primary-50-950 mx-2" onclick={()=>{modalOpen=true; currentLeaseId=lease.leaseId}}>End lease</button>
                     {/if}
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
            {/each}
         </div>
      </div>
   {/if}
{/await}