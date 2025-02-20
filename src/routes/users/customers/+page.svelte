<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageData } from './$types';
   import Header from '$lib/Header.svelte';
   import type { PartialUser } from '$lib/server/partialTypes';
   import Pagination from '$lib/displayComponents/Pagination.svelte';
   import { fade } from 'svelte/transition';
   import Search from '$lib/forms/Search.svelte';
   import Revenue from '$lib/displayComponents/Revenue.svelte';
   import type { Lease } from '@prisma/client';
   import Address from '$lib/displayComponents/Address.svelte';

   let { data }: { data: PageData } = $props();
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   let slicedSource = $derived((customers:PartialUser[]) => customers.slice((pageNum-1)*size, pageNum*size));
   let searchedSource = $derived((customers:PartialUser[]) => customers.filter((customer) => {
      return customer.familyName?.toLowerCase().includes(search.toLowerCase()) || customer.givenName?.toLowerCase().includes(search.toLowerCase())
   }))
   const totalLeased = $derived((leases:Lease[]) => {
      let totalLeased = 0;
      leases.forEach((lease) => {
         totalLeased += lease.price
      });
      return totalLeased
   })
</script>
<Header title='Current Customers'/>
{#await data.customers}
    ...loading {data.customerCount} customers
{:then customers}
   {#await data.leases}
      loading leases...
   {:then leases} 
      {#await data.addresses}
         loading addresses
      {:then addresses}    
         <div transition:fade={{duration:600}} class="mt-10">
            <Search bind:search={search} searchType='customer name' data={data.userSearchForm} classes='m-2 border-b-2 border-primary-50 dark:border-primary-950'/>
            <Revenue label='Current monthly invoiced' amount={totalLeased(leases)} classes='m-2 border-b-2 border-primary-50 dark:border-primary-950'/>
            <div class="grid grid-cols-1 mx-2 gap-y-3 gap-x-1">
               {#each slicedSource(searchedSource(customers)) as customer}
               {@const address = addresses.find((address) => address.userId === customer.id)}
               {@const lease = leases.find((lease) => lease.customerId === customer.id)}
                  <div class="border rounded-lg border-primary-50 dark:border-primary-950 sm:grid sm:grid-cols-2">
                     <div class="p-2">
                        <UserEmployee user={customer} classes=''/>
                        {#if address}
                           <Address {address} />
                        {/if}
                     </div>
                     {#if lease}
                        <LeaseEmployee {lease} classes='p-2'/>
                     {/if}
                  </div>
               {/each}
            </div>
            <Pagination bind:pageNum={pageNum} bind:size={size} label='users' array={searchedSource(customers)}/>
         </div>
      {/await}
   {/await}
{/await}