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
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { PanelTopClose, SearchIcon } from 'lucide-svelte';

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
   let searchDrawerOpen = $state(false);
</script>
<Header title='Current Customers'/>
{#await data.customers}
   <div class="mt-10 m-1">
      Loading {data.customerCount} customers...
   </div>
{:then customers}
   {#await data.leases}
      <div class="mt-10">
         Loading leases...
      </div>   
   {:then leases} 
      {#await data.addresses}
         <div class="mt-10">
            Loading addresses...
         </div>
      {:then addresses}    
         <div in:fade={{duration:600}}>
            <Revenue label='Current monthly invoiced' amount={totalLeased(leases)} classes='fixed top-9 w-screen left-0 bg-tertiary-50-950 rounded-b-lg'/>
            <Modal
               open={searchDrawerOpen}
               onOpenChange={(event)=>(searchDrawerOpen = event.open)}
               triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50'
               contentBase='bg-surface-100-900 h-[230px] w-screen rounded-b-lg'
               positionerJustify=''
               positionerAlign=''
               positionerPadding=''
               transitionsPositionerIn={{y:-360, duration: 600}}
               transitionsPositionerOut={{y:-360, duration: 600}}
               modal={false}
            >
               {#snippet trigger()}
                  <SearchIcon aria-label='search' />
               {/snippet}
               {#snippet content()}
                  <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose/></button>
                  <Search bind:search={search} searchType='customer name' data={data.userSearchForm} classes='m-2 border-b-2 border-primary-50-950'/>
               {/snippet}
            </Modal>
            <div class="grid grid-cols-1 mx-1 sm:mx-2 gap-y-3 gap-x-1 mt-22 sm:mt-18">
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