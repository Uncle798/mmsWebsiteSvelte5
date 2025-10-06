<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
   import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

<Header title='Recently Moved Out' />

{#await data.units}
   <div class="mt-14 sm:mt-10">
      Loading units...
   </div>
{:then units}
   {#await data.leases}
      <div class="mt-14 sm:mt-10">
         Loading leases...
      </div>
   {:then leases} 
      {#await data.customers}
         <div class="mt-14 sm:mt-10">
            Loading customers...
         </div>
      {:then customers}
         {#await data.addresses}
            <div class="mt-14 sm:mt-10">
               Loading addresses...
            </div>
         {:then addresses}             
            <div class="grid grid-cols-1 gap-1 mt-14 sm:mt-10">
               {#each units as unit}
               {@const unitLeases = leases.filter((lease) => lease.unitNum === unit.num)}
                  <div class="mx-2 border-2 border-primary-50-950 rounded-lg">
                     <UnitEmployee {unit} classes=''/>
                     <UnitNotesForm data={data.unitNotesForm} {unit} classes='mx-1'/>
                     {#each unitLeases as lease}
                     {@const customer = customers.find((customer) => customer.id === lease.customerId)}
                     {@const address = addresses.find((address) => address.addressId === lease.addressId)}
                        <div class="m-1 border border-primary-50-950 rounded-md">
                           <LeaseEmployee {lease} />
                           {#if customer}
                              <UserEmployee user={customer} classes='mx-2' />
                           {/if}
                           {#if address}
                              <AddressEmployee {address} classes='mx-2' />
                           {/if}
                        </div>
                     {/each}
                  </div>
               {/each}
            </div> 
         {/await}
      {/await}
   {/await}
{/await}