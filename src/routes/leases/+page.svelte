<script lang="ts">
   import Header from '$lib/Header.svelte';
	import type { User, Lease } from '@prisma/client';
   import type { PageData } from './$types';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { SearchIcon, PanelTopClose } from 'lucide-svelte';
   let { data }: { data: PageData } = $props();
   let search = $state('');
   let pageNum = $state(1);
   let size = $state(25);
   let searchedLeases = $derived((leases:Lease[]) => leases.filter((lease) => lease.leaseId.includes(search)))
   let slicedLeases = $derived((leases:Lease[]) => leases.slice((pageNum-1)*size, pageNum*size));
   const currentCustomers = $derived((users:User[]) => {
      const returnedUsers = users.filter((user) => {
         return user.familyName?.includes(customerSearch) 
         || user.givenName?.includes(customerSearch)
         || user.organizationName?.includes(customerSearch)
      })
      return returnedUsers;
   })
   const searchByCustomer = $derived((leases:Lease[], customers:User[]) => {
      const returnedLeases:Lease[] =[];
      for(const customer of customers){
         const customerLeases = leases.filter((lease) => lease.customerId === customer.id)
         for(const cL of customerLeases){
            returnedLeases.push(cL)
         }
      }
      return returnedLeases
   })
   let customerSearch = $state('');
   let searchDrawerOpen = $state(false);
   let sortBy = $state(false);
   let sortedByUnitNum = $derived((leases:Lease[]) => leases.sort((a,b) => {
      if(a.unitNum > b.unitNum){
         if(sortBy){
            return -1
         }
         return 1
      }
      if(a.unitNum === b.unitNum){
         return 0
      }
      if(a.unitNum < b.unitNum){
         if(sortBy){
            return 1
         }
         return -1
      }
      return 0
   }))
</script>
<Header title='All leases' />

{#await data.leases}
   <div class="mt-14 sm:mt-10">
      Loading {data.leaseCount} leases...
   </div>
{:then leases}
   {#await data.customers}
      <div class="mt-14 sm:mt-10 mx-1">
         Loading customers...
      </div>
   {:then customers} 
      {#await data.addresses}
         <div class="mt-14 sm:mt-10 mx-1">
            Loading addresses...
         </div>
      {:then addresses}
         <Modal
            open={searchDrawerOpen}
            onOpenChange={(event)=>(searchDrawerOpen = event.open)}
            triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50 h-12 sm:h-8'
            contentBase='bg-surface-100-900 h-[280px] w-screen rounded-lg'
            positionerJustify=''
            positionerAlign=''
            positionerPadding=''
            transitionsPositionerIn={{y:-280, duration: 600}}
            transitionsPositionerOut={{y:-280, duration: 600}}
            modal={false}
         >
            {#snippet trigger()}
               <SearchIcon aria-label='Close'/>
            {/snippet}
            {#snippet content()}
               <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose aria-label='Close'/></button>
               <Search bind:search={search} searchType='lease id' data={data.searchForm} classes='mt-10 mx-1'/>
               <Search bind:search={customerSearch} searchType='customer name' data={data.searchForm} classes='mx-1' />
               <button class="btn preset-filled-primary-50-950 " onclick={() => sortBy = !sortBy}>Sort by unit number {sortBy ? 'ascending' : 'descending'}</button>
            {/snippet}
         </Modal>
         <div class="rounded-lg mt-14 sm:mt-10">
            {#each slicedLeases(sortedByUnitNum(searchedLeases(searchByCustomer(leases, currentCustomers(customers))))) as lease}
            {@const customer = customers.find((customer) => customer.id === lease.customerId)}
            {@const leaseAddress = addresses.find((address) => address.addressId === lease.addressId)}
               <div class="grid sm:grid-cols-2 border border-primary-50-950 m-2 rounded-lg">
                  <LeaseEmployee lease={lease} classes='mx-2'/>
                  {#if customer}
                     <div class='m-2'> 
                        <UserEmployee user={customer} />
                        {#if leaseAddress}
                           <AddressEmployee address={leaseAddress} />
                        {/if}
                     </div>
                  {/if}
               </div>
            {/each}
         </div>
         <Pagination bind:size={size} bind:pageNum={pageNum} array={searchedLeases(leases)} label='leases'/>
      {/await}
   {/await}
{/await}